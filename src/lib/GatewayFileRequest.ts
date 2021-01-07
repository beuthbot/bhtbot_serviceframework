import fileUpload from 'express-fileupload';

export default class GatewayFileRequest {
  files: fileUpload.FileArray;
  constructor(files: fileUpload.FileArray) {
    this.files = files;
  }
}
