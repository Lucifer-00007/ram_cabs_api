const axios = require("axios");
const nodemailer = require("nodemailer");
const credentials = require("../../config/firebase-config-v1.1.json");
const admin = require("firebase-admin");

if (!admin.apps.length) {
	// initialized firebase app.
    admin.initializeApp({
        credential: admin.credential.cert(credentials)
    })    
}else {
    // if already initialized.
    admin.app(); 
}
const db = admin.firestore();


const AuthenticationController = {
	//User Signup Api
	signupUser: async (req, res) => {
		const user = db.collection('users');

		try {
			const { name, email, gender, phone } = req.body;

			if (!name || !email || !gender || !phone) {
				throw new Error("Enter all the data!");
			}

			// Checking if user is already in database using email
			const emailExist = await user.doc(email).get();
			if (emailExist.exists) throw new Error("Email Already Exist!");

			// Checking if user is already in database using phone
			const CheckPhoneExist = await user.get();
			CheckPhoneExist.forEach(doc => {
				if (doc.data().phone == phone) throw new Error("Phone Number Already Exist!");
			});

			//Save user data for auth.
			// const userResponse = await admin.auth().createUser({
			// 	email: email,
			// 	password: pass,
			// 	emailVerified: false,
			// 	disabled: false 
			// })

			//Save user data to firestore.
			const userJson = {
				name: name,
				email: email.toLowerCase(),
				gender: gender,
				phone: phone,
				emailVerified: false,
				disabled: false,
			}

			//Add new user with default uid.
			// const userResponse = await user.add(userJson);

			//Set new user with email as uid.
			const userResponse = await user.doc(email).set(userJson);

			res.status(200).json({ success: true, data: userResponse, details: userJson })
		} catch (error) {
			res.status(400).json({ success: false, error: { message: error.message } });
		}
	},

	signupDriver: async (req, res) => {
		const driver = db.collection('driver');

		try {
			const { name, email, emergencyPhone, aadharNo, permAddress, locAddress, LicenceNo, carPlateNumber, ModelType, insuranceNo, insuranceExpDate, pollutionNo, pollutionExpDate } = req.body;
			
			// const { selfPhoto, aadharFront, aadharback } = req.file.path;
			
			// Check if all the datas are available.
			if (!name || !email || !emergencyPhone || !aadharNo || !permAddress || !locAddress || !LicenceNo || !carPlateNumber || !ModelType || !insuranceNo || !insuranceExpDate || !pollutionNo || !pollutionExpDate) {
				throw new Error("Enter all the data!");
			}

			// Check if all photos are available.
			// if (!selfPhoto || !aadharFront || !aadharback){
			// 	throw new Error("upload all the photos!");
			// }

			// Checking if driver is already in database using email
			const emailExist = await driver.doc(email).get();
			if (emailExist.exists) throw new Error("Email Already Exist!");

			// Checking if driver is already in database using phone
			const CheckPhoneExist = await driver.get();
			CheckPhoneExist.forEach(doc => {
				if (doc.data().phone == phone) throw new Error("Phone Number Already Exist!");
			});

			//Save driver data to firestore.
			const driverJson = {
				name: name,
			 	email: email.toLowerCase(),
				emergencyPhone: emergencyPhone,
				aadharNo: aadharNo,
				permAddress: permAddress,
				locAddress: locAddress,
				LicenceNo: LicenceNo,
				carPlateNumber: carPlateNumber,
				ModelType: ModelType,
				insuranceNo: insuranceNo,
				insuranceExpDate: insuranceExpDate,
				pollutionNo: pollutionNo,
				pollutionExpDate: pollutionExpDate
			}

			//Set new driver with email as uid.
			const driverResponse = await driver.doc(email).set(driverJson);

			res.status(200).json({ success: true, data: driverResponse, details: driverJson })
		} catch (error) {
			res.status(400).json({ success: false, error: { message: error.message } });
		}
	},

	//User Login Api
	loginUser: async (req, res) => {
		try {
			const { phone } = req.body;
			const user = db.collection('users');

			if (!phone) {
				throw new Error("phone is missing in body!");
			}
			
			const CheckPhoneExist = await user.get();
			CheckPhoneExist.forEach(doc => {
				if (doc.data().phone == phone){
					
					//throw error if user phone number exist and send user data.
					let err = new Error('Phone number already exists!');
					err.UserExistStatus = true;
					err.data = doc.data();
					throw err;
				}

			});

			res.status(200).json({ success: true, UserExistStatus: false})
			
		} catch (error) {
			res.status(400).json({ success: false, errorDetails: error, error: { message: error.message } });
		}


		// const { email, pin } = req.body;
		// try {
		// 	const { error } = await loginValidation(req.body);
		// 	if (error) throw new Error(error.details[0].message);

		// 	const user = await User.findOne({ email });
		// 	if (!user) throw new Error("User Not Found!");

		// 	let loginAttempts = user.loginAttempts;

		// 	if (parseInt(loginAttempts) >= 5) {
		// 		throw new Error("Login Attempts Exceeded! Account Blocked.!");
		// 	}

		// 	const isValidPin = await bcrypt.compare(pin, user.pin);
		// 	if (!isValidPin) {
		// 		user.loginAttempts = `${parseInt(loginAttempts) + 1}`
		// 		await user.save();
		// 		throw new Error(`Invalid Pin! ${5 - parseInt(user.loginAttempts)} Attempts Left. `);
		// 	}
		// 	//Resetting login Attempts if login successfully.
		// 	user.loginAttempts = "0";
		// 	await user.save();

		// 	let accessToken = await user.createAccessToken();
		// 	let refreshToken = await user.createRefreshToken();

		// 	//Converting Mongdb Object to Javascript Object
		// 	let newUser = user.toJSON();
		// 	//deleting pin from user object;
		// 	delete newUser.pin;
		// 	let photos = [newUser.photo1, newUser.photo2, newUser.photo3, newUser.photo4, newUser.photo5];
		// 	delete newUser.photo1;
		// 	delete newUser.photo2;
		// 	delete newUser.photo3;
		// 	delete newUser.photo4;
		// 	delete newUser.photo5;
		// 	newUser.photos = photos;
		// 	// res.cookie('accessWorld',"hello",{httpOnly:true,maxAge:1000*60*60*24*7,domain:'whrool.com'});
		// 	res.status(200).json({
		// 		success: true,
		// 		data: {
		// 			accessToken,
		// 			refreshToken,
		// 			user: newUser
		// 		},
		// 	});
		// } catch (err) {
		// 	res.status(400).json({ success: false, error: { message: err.message } });
		// }
	},

	//Driver Login Api
	loginDriver: async (req, res) => {
		try {
			const { phone } = req.body;
			const driver = db.collection('driver');

			if (!phone) {
				throw new Error("phone is missing in body!");
			}
			
			const CheckPhoneExist = await driver.get();
			CheckPhoneExist.forEach(doc => {
				if (doc.data().emergencyPhone == phone){
					
					//throw error if driver number exist and send driver data. 
					let err = new Error('Phone number already exists!');
					err.UserExistStatus = true;
					err.data = doc.data();
					throw err;
				}
			});

			res.status(200).json({ success: true, UserExistStatus: false })
			
		} catch (error) {
			res.status(400).json({ success: false, errorDetails: error, error: { message: error.message } });
		}


		// const { email, pin } = req.body;
		// try {
		// 	const { error } = await loginValidation(req.body);
		// 	if (error) throw new Error(error.details[0].message);

		// 	const user = await User.findOne({ email });
		// 	if (!user) throw new Error("User Not Found!");

		// 	let loginAttempts = user.loginAttempts;

		// 	if (parseInt(loginAttempts) >= 5) {
		// 		throw new Error("Login Attempts Exceeded! Account Blocked.!");
		// 	}

		// 	const isValidPin = await bcrypt.compare(pin, user.pin);
		// 	if (!isValidPin) {
		// 		user.loginAttempts = `${parseInt(loginAttempts) + 1}`
		// 		await user.save();
		// 		throw new Error(`Invalid Pin! ${5 - parseInt(user.loginAttempts)} Attempts Left. `);
		// 	}
		// 	//Resetting login Attempts if login successfully.
		// 	user.loginAttempts = "0";
		// 	await user.save();

		// 	let accessToken = await user.createAccessToken();
		// 	let refreshToken = await user.createRefreshToken();

		// 	//Converting Mongdb Object to Javascript Object
		// 	let newUser = user.toJSON();
		// 	//deleting pin from user object;
		// 	delete newUser.pin;
		// 	let photos = [newUser.photo1, newUser.photo2, newUser.photo3, newUser.photo4, newUser.photo5];
		// 	delete newUser.photo1;
		// 	delete newUser.photo2;
		// 	delete newUser.photo3;
		// 	delete newUser.photo4;
		// 	delete newUser.photo5;
		// 	newUser.photos = photos;
		// 	// res.cookie('accessWorld',"hello",{httpOnly:true,maxAge:1000*60*60*24*7,domain:'whrool.com'});
		// 	res.status(200).json({
		// 		success: true,
		// 		data: {
		// 			accessToken,
		// 			refreshToken,
		// 			user: newUser
		// 		},
		// 	});
		// } catch (err) {
		// 	res.status(400).json({ success: false, error: { message: err.message } });
		// }
	},

	//Verify Email and Phone before signup
	verifyEmailAndPhone: async (req, res) => {
		res.status(200).json({
			success: true,
			msg: "verify Email And Phone"
		});

		// try {
		// 	const { email, phone } = req.body;
		// 	if (!email || !phone) {
		// 		throw new Error("Email or Phone is missing in body!");
		// 	}

		// 	// Checking if user is already in database using email
		// 	const emailExist = await User.findOne({ email });
		// 	if (emailExist) throw new Error(EmailExist.message);

		// 	// Checking if user is already in database using phone
		// 	const phoneExist = await User.findOne({ phone });
		// 	if (phoneExist) throw new Error(PhoneExist.message);

		// 	res
		// 		.status(200)
		// 		.json({
		// 			success: true,
		// 			data: { message: "Email and Phone does not Exist!" },
		// 		});
		// } catch (err) {
		// 	res.status(400).json({ success: false, error: { message: err.message } });
		// }
	},

	//To check whether email already exist or not
	checkEmailExist: async (req, res) => {
		res.status(200).json({
			success: true,
			msg: "Check Email Exist!"
		});

		// try {
		// 	const { email } = req.body;
		// 	if (!email) {
		// 		throw new Error("Email is missing in body!");
		// 	}
		// 	// Checking if user is already in database using email
		// 	const emailExist = await User.findOne({ email });
		// 	if (!emailExist) {
		// 		throw new Error("Email does not exist!");
		// 	}
		// 	res
		// 		.status(200)
		// 		.json({ success: true, data: { message: "Email Exist!" } });
		// } catch (err) {
		// 	res.status(400).json({ success: false, error: { message: err.message } });
		// }
	},

	//To send otp to phone number
	sendPhoneOtp: async (req, res) => {
		try {
			const { mobile_no } = req.body;
			const otpData = db.collection('otpData');

			if (!mobile_no) {
				throw new Error("mobile_no is missing in body!");
			}

			//Generate OTP
			const otp = Math.floor(Math.random() * 100000) + 100000;
			const now = new Date();

			//OTP message
			const otp_msg = `Dear Customer your otp is: ${otp.toString()}, SVMTPL`;

			//Otp expiration time
			var expiration_time = new Date();
			expiration_time = new Date(expiration_time.setMinutes(expiration_time.getMinutes() + 2));
			

			//Create VerificationRequest Instance in DB
			// const vr = await VerificationRequest.create({
			// 	otp,
			// 	expires: expiration_time,
			// });

			const otpJson = {
				isVerified: false,
				otp: otp,
				expires: expiration_time
			};

			//Add new otp with default uid in firestore.
			// const otpResponse = await otpData.add(otpJson);

			//Set new otp-obj with otp as uid.
			const userResponse = await otpData.doc(otp.toString()).set(otpJson);

			//details object containing the email and vr id
			const details = {
				timestamp: now,
				mobile: mobile_no,
				otp: otp,
				status: "success",
				message: `${otp} SMS Sent Successfully to User ${mobile_no}.`
			};

			//Encrypting details Object
			// const encoded = symmetricEncrypt(JSON.stringify(details), ENCRYPTION_KEY);

			const newMobile_no = mobile_no.length > 10 ? mobile_no.substring(2) : mobile_no
			const { status, message } = await axios.get(`http://teleshoppe.co.in/serv/BulkPush/?user=onlinkweb&pass=12345678&message=${otp_msg}&msisdn=${newMobile_no}&sender=SVMTPL&type=text&tempId=1007051859388551011`);

			if (status === "error") {
				throw new Error(message);
			}

			res.status(200).json({ success: true, data: message, details: details });
		} catch (err) {
			console.log(err);
			res.status(400).json({ success: false, error: { message: err.message } });
		}
	},

	//To send otp to email
	sendEmailOtp: async (req, res) => {
		try {
			const { email, type } = req.body;

			//input data validation
			if (!email || !type) {
				throw new Error("Email or Type missing in body!");
			}

			//Generate OTP
			const otp = Math.floor(Math.random() * 100000) + 100000;
			const now = new Date();

			//Otp expiration time
			// const expiration_time = AddMinutesToDate(now, 2);

			//Create VerificationRequest Instance in DB
			// const vr = await VerificationRequest.create({
			// 	otp,
			// 	expires: expiration_time,
			// });

			//details object containing the email
			const details = {
				timestamp: now,
				email: email,
				status: "success",
				OTP: otp.toString(),
			};

			//Encrypting details Object
			// const encoded = symmetricEncrypt(JSON.stringify(details), ENCRYPTION_KEY);


			function send_user_mail(details_info) {
				const transporter = nodemailer.createTransport({
					// service: "hotmail",
					service: "gmail",
					auth: {
						user: "zocar.app@gmail.com",
						pass: "mdvmnlolxubyozcw",
					}
				});

				transporter.sendMail(details_info, function (err, info) {
					if (err) {
						console.log(err)
						return err;
					} else {
						// console.log(info);
						return info
					}
				})
			}

			if (type === "SIGNUP") {
				//Signup email details
				const signupOptions = {
					from: "zocar.app@gmail.com",
					to: email,
					subject: "OTP Verification",
					text: `Dear Customer your otp is: ${otp.toString()}`
				}

				//Signup Confirmation otp email
				send_user_mail(signupOptions);

				res.status(200).json({ success: true, details: details });
			} else if (type === "RESET_PASSWORD") {
				//Reset Password confirmation otp email
				// const sentMail = await sendResetPinOtp(emailPayload);
			} else {
				//Incorrect email type error
				throw new Error("Invalid email type providedin body!");
			}



		} catch (err) {
			console.log(err);
			res.status(400).json({ success: false, error: { message: err.message } });
		}
	},

	//To verify otp email/phone
	verifyOtp: async (req, res) => {
		try {
			const { otp } = req.body;
			const otpData = db.collection('otpData');

			if (!otp) {
				throw new Error("Otp is missing in body!");
			}

			//Checking OTP in DB
			const otpExist = await otpData.doc(otp).get();
			if (!otpExist.exists) {
				throw new Error("Invalid OTP!");
			}
			
			//Checking if OTP is already used or not
			if (otpExist.data().isVerified === true) {
				throw new Error("otp-already-used");
			}

			//Mark OTP as verified or used
			await otpData.doc(otp).update({isVerified: true});
			
			// await otpExist.data().save();

			res.status(200).json({ success: true, data: { message: "Otp Verified." } });
		} catch (error) {
			res.status(400).json({ success: false, error: { message: error.message } });	
		}

		// try {
		// 	const { verification_key, otp, check, userId, type="" } = req.body;

		// 	if (!userId,!verification_key || !otp || !check) {
		// 	throw new Error("userId, Otp, check or verification_key is missing in body!");
		// 	}

		// 	// VALIDATE USER DATA BEFORE CREATING
		// 	const { error } = await verifyOtpValidation(req.body);
		// 	if (error) throw new Error(error.details[0].message);

		// 	//Decoding verification_key
		// 	let decoded = symmetricDecrypt(verification_key, ENCRYPTION_KEY);
		// 	let obj = await JSON.parse(decoded);

		// 	if (obj.check != check) throw new Error("Incorrect check email!");

		// 	//--------------------------------------------------------
		// 	//Checking email OTP in DB
		// 	const otpExist = await VerificationRequest.findById({ _id: obj.otp_id });
		// 	if (!otpExist) {
		// 	throw new Error("otp-not-found");
		// 	}

		// 	//Checking if OTP is already used or not
		// 	if (otpExist.isVerified) {
		// 	throw new Error("otp-already-used");
		// 	}

		// 	//Checking if OTP is equal to the OTP in DB
		// 	if (otp !== otpExist.otp) {
		// 	throw new Error("Incorrect Otp!");
		// 	}

		// 	//Mark OTP as verified or used
		// 	otpExist.isVerified = true;
		// 	await otpExist.save();

		// 	if(type==="MOBILE_VERIFICATION"){
		// 	//mark mobile as verified in db
		// 	await User.findByIdAndUpdate({_id:userId},{isPhoneVerified:true});
		// 	}

		// 	if(type==="EMAIL_VERIFICATION"){
		// 	//mark email as verified in db
		// 	await User.findByIdAndUpdate({_id:userId},{isEmailVerified:true});
		// 	}

		// 	res.status(200).json({ success: true, data: { message: "Otp Verified." } });
		// } catch (err) {
		// 	res.status(400).json({ success: false, error: { message: err.message } });
		// }
	},

	//User Logout Api
	logout: async (req, res) => {
		res.status(200).json({
			success: true,
			msg: "Logout"
		});

		// try {
		// 	// if(!isAuthenticated) throw new ApolloError(NotAllowed.message, NotAllowed.code);
		// 	const { refreshToken } = req.body;
		// 	if (!refreshToken) {
		// 		throw new Error("token is missing in body!");
		// 	}
		// 	const token = refreshToken.split(" ")[1];

		// 	const FindToken = await Token.findOne({ token });
		// 	if (!FindToken) {
		// 		throw new Error("Token not found!");
		// 	}

		// 	const { deletedCount } = await Token.deleteOne({ token });
		// 	if (deletedCount < 1) {
		// 		throw new Error("Unable to delete token!");
		// 	}

		// 	res
		// 		.status(200)
		// 		.json({ success: true, data: { message: "Logged Out Successfully." } });
		// } catch (err) {
		// 	res.status(400).json({ success: false, error: { message: err.message } });
		// }

	},
}


module.exports = AuthenticationController;
