/**
 * WordPress SSO Integration
 *
 * This module handles the Single Sign-On flow with WordPress
 */

import { api } from './api';

export interface WordPressSSOResponse {
  success: boolean;
  token: string;
  redirectUrl: string;
  expiresIn: number;
}

/**
 * Generate WordPress SSO token and redirect to WordPress
 *
 * @returns Promise with SSO token and redirect URL
 */
export async function initiateWordPressSSO(): Promise<WordPressSSOResponse> {
  try {
    const response = await fetch(`${api.baseURL}/wordpress/sso-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'WordPress SSO başlatılamadı');
    }

    const data: WordPressSSOResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('WordPress SSO error:', error);
    throw error;
  }
}

/**
 * Redirect to WordPress with SSO token
 */
export async function redirectToWordPress(): Promise<void> {
  try {
    const ssoData = await initiateWordPressSSO();

    // Open WordPress in a new tab
    window.open(ssoData.redirectUrl, '_blank');
  } catch (error: any) {
    alert('WordPress girişi başarısız: ' + error.message);
  }
}
