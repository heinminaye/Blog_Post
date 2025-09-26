import { NextResponse } from 'next/server';
import Joi from 'joi';

export type ApiErrorResponse = {
  success: false;
  error: string;
  message: string;
  details?: unknown;
  statusCode: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  statusCode: number;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiErrorResponse(
  error: string,
  message: string,
  statusCode: number,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      details,
      statusCode,
    },
    { status: statusCode }
  );
}

export function apiSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      statusCode,
    },
    { status: statusCode }
  );
}

export function formatValidationError(error: Joi.ValidationError) {
  return error.details.map(d => ({
    field: d.path.join('.'),
    message: d.message.replace(/"/g, ''),
  }));
}

export async function checkContentType(request: Request) {
  const contentType = request.headers.get('content-type');
  if (contentType !== 'application/json') {
    return apiErrorResponse(
      'Invalid request',
      'Content-Type must be application/json',
      400
    );
  }
  return null;
}

export async function parseJsonRequest(request: Request) {
  try {
    return await request.json();
  } catch (error) {
    console.error('JSON parse error:', error);
    return apiErrorResponse(
      'Invalid request',
      'Malformed JSON received',
      400
    );
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}