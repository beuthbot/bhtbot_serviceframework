import { FileRequestPayload } from '@bhtbot/bhtbot';
import fileUpload from 'express-fileupload';

export default class GatewayFileRequest {
  files: fileUpload.FileArray;
  payload: FileRequestPayload;

  constructor(files: fileUpload.FileArray, payload: FileRequestPayload) {
    this.files = files;
    this.payload = payload;
  }
}
