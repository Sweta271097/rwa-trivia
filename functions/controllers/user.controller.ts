

import { UserService } from '../services/user.service';
import { ProfileImagesGenerator } from '../utils/profile-images-generator';
import { MailClient } from '../utils/mail-client';
import {
    UserControllerConstants, profileSettingsConstants,
    interceptorConstants,
    ResponseMessagesConstants
} from '../../projects/shared-library/src/lib/shared/model';
import { Utils } from '../utils/utils';
import { AccountService } from '../services/account.service';

export class UserController {

    /**
     * getUserById
     * return user
     */
    static async getUserById(req, res) {
        const userId = req.params.userId;

        if (!userId) {
            // userId is not available
            Utils.sendResponse(res, interceptorConstants.BAD_REQUEST, ResponseMessagesConstants.USER_ID_NOT_FOUND);
        }
        try {
            Utils.sendResponse(res, interceptorConstants.SUCCESS, await UserService.getUserProfile(userId));
        } catch (error) {
            Utils.sendErr(res, error);
        }
    }

    /**
     * getUserImages
     * return user
     */
    static async getUserImages(req, res) {
        const userId = req.params.userId;
        const width = req.params.width;
        const height = req.params.height;


        if (!userId) {
            // userId is not available
            Utils.sendResponse(res, interceptorConstants.BAD_REQUEST, ResponseMessagesConstants.USER_ID_NOT_FOUND);
        }

        if (!width) {
            // width is not available
            Utils.sendResponse(res, interceptorConstants.BAD_REQUEST, ResponseMessagesConstants.GAME_NOT_FOUND);
        }

        if (!height) {
            // height is not available
            Utils.sendResponse(res, interceptorConstants.BAD_REQUEST, ResponseMessagesConstants.GAME_NOT_FOUND);
        }


        try {
            const stream = await UserService.getUserProfileImage(userId, width, height);
            res.setHeader('content-disposition', 'attachment; filename=profile_image.png');
            res.setHeader('content-type', 'image/jpeg');
            Utils.sendResponse(res, interceptorConstants.SUCCESS, stream);
        } catch (error) {
            Utils.sendErr(res, error);
        }

    }

    /**
     * generateUserProfileImage
     * return status
     */
    static async generateUserProfileImage(req, res) {
        if (req.body.user.userId !== req.user.uid) {
            Utils.sendResponse(res, interceptorConstants.UNAUTHORIZED, ResponseMessagesConstants.UNAUTHORIZED);
        }

        let user = req.body.user;

        try {
            if (user.profilePicture && user.croppedImageUrl && user.originalImageUrl) {

                user = await ProfileImagesGenerator.uploadProfileImage(user);

                delete user.originalImageUrl;
                delete user.croppedImageUrl;
                delete user.imageType;
            }

            if (user.bulkUploadPermissionStatus === profileSettingsConstants.NONE) {
                user.bulkUploadPermissionStatus = profileSettingsConstants.NONE;
                user.bulkUploadPermissionStatusUpdateTime = Utils.getUTCTimeStamp();
                const htmlContent = `<b>${user.displayName}</b> user with id <b>${user.userId}</b> has requested bulk upload access.`;
                try {
                    const mail: MailClient = new MailClient(UserControllerConstants.adminEmail, UserControllerConstants.mailSubject,
                        UserControllerConstants.mailSubject, htmlContent);
                    await mail.sendMail();
                } catch (error) {
                    console.error('mail error', error);
                }
            }

            user.bulkUploadPermissionStatus =
                (user.bulkUploadPermissionStatus) ? user.bulkUploadPermissionStatus : profileSettingsConstants.NONE;

            delete user['roles'];

            await UserService.updateUser({ ...user });
            Utils.sendResponse(res, interceptorConstants.SUCCESS, { 'status': ResponseMessagesConstants.PROFILE_DATA_IS_SAVED });

        } catch (error) {
            Utils.sendErr(res, error);
        }
    }

    /**
     * updateLives
     * return status
     */
    static async updateLives(req, res) {
        const userId = req.body.userId;
        if (!userId) {
            Utils.sendResponse(res, interceptorConstants.FORBIDDEN, ResponseMessagesConstants.USER_ID_NOT_FOUND);
        }
        if (req.user.user_id !== userId) {
            Utils.sendResponse(res, interceptorConstants.FORBIDDEN, ResponseMessagesConstants.UNAUTHORIZED);
        }

        try {
            await AccountService.updateLives(userId);
            Utils.sendResponse(res, interceptorConstants.SUCCESS, { 'status': ResponseMessagesConstants.LIVES_ADDED });
        } catch (error) {
            Utils.sendErr(res, error);
        }

    }

}









