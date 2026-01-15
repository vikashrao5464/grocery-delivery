"use client"
import RegisterForm from '@/components/RegisterForm';
import Welcome from '@/components/Welcome'
import React, { useState } from 'react'


const page = () => {
  const [step,setStep]=useState(1);
  return (
    <div>
      {step==1 ? <Welcome nextStep={setStep}/> : <RegisterForm previousStep={setStep}/>}
     
    </div>
  )
}

export default page
