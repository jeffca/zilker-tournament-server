import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import * as mongoose from 'mongoose';

export interface VerificationCode extends mongoose.Document {
  _id: string;
  phone: string;
  code: number;
}

const VerificationCodeType: DocumentNode = gql`
  type VerificationCode {
    _id: String
    phone: String
    code: Int
  }
`;

export default VerificationCodeType;
