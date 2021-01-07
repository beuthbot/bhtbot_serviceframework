import fs from 'fs';
import * as path from 'path';

import tmp from 'tmp';

/*
export default class FileAnswer {

  readonly file: Buffer;
  readonly fileName: string;

  constructor(fileNameWithExtension: string, file: Buffer) {
    this.file = file;
    this.fileName = fileNameWithExtension;
  }

  static fromPath(filePath: string){
    const file = fs.readFileSync(filePath);
    const fileNameWithExt = path.basename(filePath)
    return new FileAnswer(fileNameWithExt, file);
  }
}
*/

export default class FileAnswer {
  readonly filePath: string;
  readonly fileName: string;

  constructor(fileName: string, filePath: string) {
    this.fileName = fileName;
    this.filePath = filePath;
  }

  static fromPath(filePath: string) {
    const fileNameWithExt = path.basename(filePath);
    return new FileAnswer(fileNameWithExt, filePath);
  }

  static fromBuffer(buffer: Buffer, targetFilenameWithExtension: string) {
    // const tmpDir = tmp.dirSync();
    const tmpFile = tmp.dirSync().name + '/' + targetFilenameWithExtension;
    // const file = fs.writeFile(tmpDir.name + )
    // const tmpFileHolder = tmp.fileSync();
    // fs.appendFileSync(tmpFileHolder.fd, buffer);
    fs.writeFileSync(tmpFile, buffer);
    console.log(tmpFile);
    return new FileAnswer(targetFilenameWithExtension, tmpFile);
  }
}
