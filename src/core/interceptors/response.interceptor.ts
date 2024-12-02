import { Observable } from "rxjs"
import { map } from "rxjs/operators"

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"

export interface Response<T> {
  statusCode: number
  data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data
      }))
    )
  }
}
