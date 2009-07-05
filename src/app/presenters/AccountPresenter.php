<?php

/**
 * Account and everything around.
 *
 * @author     Honza Javorek, http://www.javorek.net/
 * @copyright  Copyright (c) 2008 Jan Javorek
 * @package    Javorek
 */
class AccountPresenter extends BasePresenter {

	/**
	 * @persistent
	 */
	public $request;
	
	/********************* openid helpers *********************/
	
	/**
	 * Preparations for OpenID.
	 */
	public function openId() {
		$oid = array();
		
		// error reporting
		$oldErrorReportingLevel = error_reporting(E_ALL);
		
		$oid['trustRoot'] = Environment::getVariable('absoluteUri');
		$oid['returnTo'] = $oid['trustRoot'] . 'ucet/openid/?request=' . $this->request;

		// windows machines
		define('Auth_OpenID_RAND_SOURCE', NULL);
			
		// path to cache
		$oid['store'] = new Auth_OpenID_FileStore(Environment::getVariable('tempDir'));
		$oid['consumer'] = new Auth_OpenID_Consumer($oid['store']);
		
		// back to the old error reporting level
		error_reporting($oldErrorReportingLevel);
		
		return $oid;
	}
	
	/********************* view default *********************/
	
	public function actionDefault() {
		$this->authenticate();
	}
	
	public function prepareDefault() {
		$form = new AppForm($this, 'editUser');

		$user = Environment::getUser();
		$identity = $user->getIdentity();
		
		// gender check
		$names = preg_split('~[ \\-,]+~', $identity->fullname);
		$ova = FALSE;
		foreach ($names as $name) {
			$ending = mb_substr($name, -3, 3);
			if ($ending == 'ova' || $ending == 'ová') {
				$ova = TRUE;
				break;
			}
		}
		$this->template->ova = $ova;
		
		// gender
		$this->template->female = $identity->female;
		$form->addRadioList('female', 'Pohlaví', array(0 => 'chlapeček', 1 => 'holčička'))
			->addRule(Form::FILLED, 'Když neznáš své pohlaví, tak se podívej dolů.')
				->setValue($identity->female);
		$form->addSubmit('gender', 'Teď je to správně');

		// bio
		$form->addTextarea('description', 'Text', 40, 4)
			->setValue($identity->description);
		$form->addSubmit('bio', 'Uložit můj životní příběh');
		
		// saving
		$form->onSubmit[] = array($this, 'editUser');
		$this->template->form = $form;
	}
	
	public function editUser(AppForm $form) {
		$data = $form->getValues();

		$user = Environment::getUser();
		$identity = $user->getIdentity();
		
		$u = new Users;
		$u->update($identity->id, $data);
		
		$user->authenticate($identity->username, NULL);
	}
	
	public function renderDefault() {
		$user = Environment::getUser();
		$identity = $user->getIdentity();

		$this->template->username = $identity->username;
		$this->template->fullname = $identity->fullname;
		$this->template->email = $identity->email;
		$this->template->female = $identity->female;
		
		// title
		$title = ($identity->female)?  'Borkyně ' : 'Borec ';
		$this->template->title = $title . $identity->fullname;
	}
	
	/********************* view login *********************/

	public function prepareLogin($request) {
		$form = new AppForm($this, "loginUser");

		// elements
		$form->addText('openid', 'OpenID', NULL)
			->addRule(Form::FILLED, 'Neznáš své OpenID? Nápovědu najdeš pod formulářem.');
		$form->addSubmit('send', 'Pusťte mě tam!');

		// saving
		$form->onSubmit[] = array($this, 'loginUser');
		$this->template->form = $form;
	}

	public function loginUser(AppForm $form) {
		$data = $form->getValues();
		try {
			// data
			$oid = $this->openId();
			$openid = $data['openid'];

			// error reporting
			$oldErrorReportingLevel = error_reporting(E_ALL);
			
			// step 2 and 3
			$authRequest = $oid['consumer']->begin($openid);
			if (!$authRequest) {
				throw new AuthenticationException('Invalid OpenID.');
			}

			// SimpleRegister
			$sregRequest = Auth_OpenID_SRegRequest::build(
			array('fullname'), // mandatory
			array('nickname', 'email', 'gender')); // optional

			if ($sregRequest) {
				$authRequest->addExtension($sregRequest);
			}

			// step 4, redirect
			if ($authRequest->shouldSendRedirect()) {
				// http redirect
				$redirectUrl = $authRequest->redirectURL($oid['trustRoot'], $oid['returnTo']);
				if (Auth_OpenID::isFailure($redirectUrl)) {
					throw new AuthenticationException('Redirect error: ' . $redirectUrl->message);
				} else {
					header("Location: " . $redirectUrl);
					exit();
				}
			} else {
				// javascript post form redirect
				$formId = 'openid_message';
				$formHtml = $authRequest->htmlMarkup($oid['trustRoot'], $oid['returnTo'], false, array('id' => $formId));

				if (Auth_OpenID::isFailure($formHtml)) {
					throw new AuthenticationException('Redirect error: ' . $redirectUrl->message);
				} else {
					print $formHtml;
				}
			}

			// back to the old error reporting level
			error_reporting($oldErrorReportingLevel);
			exit();
			
		} catch (AuthenticationException $e) {
			$this->template->form->addError('Přihlášení se nepovedlo. (' . $e->getMessage() . ')');
		}
	}

	public function renderLogin($request) {
		$this->template->title = 'Přihlášení';
	}

	/********************* view openid *********************/
	
	public function actionOpenid($request) {
		try {
			$oid = $this->openId();

			// error reporting
			$oldErrorReportingLevel = error_reporting(E_ALL);
	
			// finishing, step 7 
			$response = $oid['consumer']->complete($oid['returnTo']);
	
			// checking result from $response->status
			if ($response->status == Auth_OpenID_CANCEL) {
			    throw new AuthenticationException('Autentizace zrušena.');
			} else if ($response->status == Auth_OpenID_FAILURE) {
			    throw new AuthenticationException('Autentizace selhala (' . $response->message . ').');
			} else if ($response->status == Auth_OpenID_SUCCESS) {
				// all right
			    $identity = $response->getDisplayIdentifier();
			    if ($response->endpoint->canonicalID) {
			        $identity = $response->endpoint->canonicalID;
			    }
			
			    // info from Simple Registration
			    $sregResp = Auth_OpenID_SRegResponse::fromSuccessResponse($response);
			    $sreg = $sregResp->contents();

			    if (empty($sreg['fullname'])) {
			        throw new AuthenticationException('OpenID neposkytlo celé jméno. Bez něj to bohužel nepůjde.');
			    }
	
			    $identity = trim(str_replace(array('http://', 'https://'), '', $identity), '/'); // sanitize ID
			    $fullname = $sreg['fullname'];
			    $female = (empty($sreg['gender']) || $sreg['gender'] == 'M')? 0 : 1;
			    
			    // email
			    $email = NULL;
				if (!empty($sreg['nickname']) && preg_match('~^[^@\s]+@[^@\s]+\.[a-z]{2,10}$~i', $sreg['nickname'])) {
					// attempt to resolve email from nickname (seznam.cz)
		    		$email = $sreg['nickname'];
		    	} elseif(!empty($sreg['email'])) {
		    		$email = $sreg['email'];
		    	}
			    
				// success
				$user = Environment::getUser();
				$user->authenticate($identity, NULL, array(
					'email' => $email,
					'fullname' => $fullname,
					'female' => $female,
				));
				$this->getApplication()->restoreRequest($this->request);
				$this->redirect('Default:');
			}
			
			// back to the old error reporting level
			error_reporting($oldErrorReportingLevel);
		} catch (AuthenticationException $e) {
			$this->flashMessage($e->getMessage(), 'error');
			$this->redirect('Account:error');
		}
	}
	
	/********************* view error *********************/
	
	public function prepareError() {
		$this->template->errors = $this->template->flashes;
		$this->template->flashes = array();
		$this->template->title = 'Přihlášení se nezdařilo';
	}
	
	/********************* view logout *********************/

	public function actionLogout($request) {
		$this->authenticate();
		Environment::getUser()->signOut();
		$this->flashMessage('Odhlášení proběhlo úspěšně!');
		$this->getApplication()->restoreRequest($this->request);
		$this->redirect('Default:');
	}

}
