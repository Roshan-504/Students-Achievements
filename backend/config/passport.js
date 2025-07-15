import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { generateToken } from '../utils/jwtToken.js';

import student_profile from '../models/student_profileModel.js';
import faculty_profiles from '../models/faculty_profiles.js';
import admin_accounts from '../models/admin_accounts.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0]?.value;
        const pic = profile.photos[0]?.value;
        let firstName = profile.name.givenName;
        let lastName = profile.name.familyName;
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

        // 1. Validate email
        if (!email || !email.endsWith('@ves.ac.in')) {
          const error = new Error('Only VES email accounts allowed');
          return done(error, false, { 
            message: 'Only VES email accounts are allowed.' 
          });
        }
        
        // 1. Check if email exists in any collection
        const [student, faculty, admin] = await Promise.all([
          student_profile.findOne({ email_id: email }),
          faculty_profiles.findOne({ email_id: email }),
          admin_accounts.findOne({ email_id: email })
        ]);

        // const admin = {
        //     email : email,
        //     pic : pic,
        //     firstName : firstName,
        //     lastName : lastName
        // }
        // const faculty = null
        // const student = null

        if (!student && !faculty && !admin) {
          const error = new Error('User not registered in system');
          return done(error, false, { message: 'User not registered in system' });
        }

        // 2. Determine role and user data
        let user, role;
        if (student) {
          role = 'student';
          user = student;
        } else if (faculty) {
          role = 'faculty';
          user = faculty;
        } else {
          role = 'admin';
          user = admin;
        }

        user = {...user.toObject()
                ,role:role, 
                email : email,
                pic : pic,
                firstName : firstName,
                lastName : lastName
              } // toObject because it was originally mongoose document

        // user = {...user,role:role} 

        // 3. Generate JWT with essential data
        const token = generateToken(user);

        done(null, { user, token });
      } catch (err) {
        done(err, false);
      }
    }
  )
);
