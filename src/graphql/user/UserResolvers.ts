import S3, { ManagedUpload } from 'aws-sdk/clients/s3';
import { nanoid } from 'nanoid';
import mime from 'mime'
import { FileUpload } from 'graphql-upload';
import UserModel  from './UserModel';
import type { Context, VerifiedContext } from '../TypeDefinitions';
import { User } from './UserTypes';
import { mapToUser, mapToUsers } from '../../mappers/mappers';

// todo change to parameter store
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

type UpdateUserDetailsPayload = {
  firstName?: string,
  lastName?: string,
  rating?: number,
};

type UploadPhotoArgs = {
  photo: FileUpload,
};

type GetUserArgs = {
  userId: string,
};

type GetUsersArgs = {
  userIds: string[],
  filterTerm?: string,
};

const resolvers = {
  // Query
  me: (_: void, args: void, context: Context): Nullable<User> => context.user,

  getUser: async (_: void, { userId }: GetUserArgs): Promise<Nullable<User>> => {
    return UserModel.findOne({ _id: userId }).then(mapToUser);
  },

  getUsers: async (_: void, { userIds, filterTerm }: GetUsersArgs): Promise<User[]> => {
    const query = filterTerm
      ? {
        _id: { $in: userIds },
        name: {
          $regex: new RegExp(`^${filterTerm}`, 'ig')
        }
      }
      : { _id: { $in: userIds } };

    return UserModel.find(query).then(mapToUsers);
  },

  // Mutation
  updateUserDetails: async (_: void, {
    payload
  }: { payload: UpdateUserDetailsPayload }, context: VerifiedContext): Promise<boolean> => {

    await UserModel.findOneAndUpdate({ _id: context.user._id }, payload);

    return true;
  },

  uploadPhoto: async (_: void, { photo }: UploadPhotoArgs, context: VerifiedContext): Promise<boolean> => {
    const { createReadStream, mimetype } = await photo;

    const params = {
      Bucket: process.env.S3_PHOTO_BUCKET || '',
      Key: `${nanoid()}.${mime.extension(mimetype)}`,
      Body: createReadStream(),
      ContentType: 'image/jpeg'
    };

    const url: string = await new Promise((resolve, reject) => {
      s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Location);
        }
      });
    });

    await UserModel.findOneAndUpdate({ _id: context.user._id }, { photo: url });

    // delete old photo
    if (context.user.photo) {
      const deleteParams = {
        Bucket: process.env.S3_PHOTO_BUCKET || '',
        Key: context.user.photo,
      };

      await new Promise((resolve, reject) => {
        s3.deleteObject(deleteParams, (err: Error, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }

    return true;
  },

  deletePhoto: async (_: void, _args: void, context: VerifiedContext): Promise<boolean> => {
    // todo this function does not seem to work, photos still present in s3
    // possibly this is working but re-upload also needs to delet
    const params = {
      Bucket: process.env.S3_PHOTO_BUCKET || '',
      Key: context.user.photo || '',
    };

    await new Promise((resolve, reject) => {
      s3.deleteObject(params, (err: Error, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    await UserModel.findOneAndUpdate({ _id: context.user._id }, { $unset: { photo: 1 } });

    return true;
  }
};

export default resolvers;
