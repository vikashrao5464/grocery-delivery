"use client"
import RegisterForm from '@/components/RegisterForm';
import { useRouter } from 'next/navigation';
import React from 'react'


const RegisterPage = () => {
  const router = useRouter();

  return (
    <div>
      <RegisterForm previousStep={() => router.push('/')}/>
    </div>
  )
}

export default RegisterPage
