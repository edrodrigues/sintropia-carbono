import { type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    return Response.next()
}

export const config = {
    matcher: '/',
}
