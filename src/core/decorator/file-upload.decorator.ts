import { applyDecorators, UseInterceptors } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiBody, ApiConsumes } from "@nestjs/swagger"

import { FileUploadDto } from "../dto/file-upload.dto"

/** Add all file upload decorators at once
 *
 * <br>Example: Upload product picture
 */
export function FileUpload(): <TFunction extends object>(
  target: object | TFunction,
  propertyKey?: string | symbol
) => void {
  return applyDecorators(
    UseInterceptors(FileInterceptor("file")),
    ApiConsumes("multipart/form-data"),
    ApiBody({ type: FileUploadDto })
  )
}
