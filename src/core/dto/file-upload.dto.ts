import { ApiProperty } from "@nestjs/swagger"

import { File } from "../type/file"

/** Describes the information needed to upload a file */
export class FileUploadDto {
  /**
   * Product picture
   * @example "picture.png"
   */
  @ApiProperty({ type: "string", format: "binary" })
  file: File
}
