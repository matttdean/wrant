import React from 'react'

export default function Header() {
  return (
    <header className='sm:w-8/12 h-10 mt-10'>
        <h1 className="text-4xl font-bold dark:text-slate-600 inline mr-3">Wrant</h1>
        <span className='text-2xl inline dark:text-slate-600 mr-3'>|</span>
        <p className='text-2xl inline dark:text-slate-600 font-medium'>Let it all out...</p>
    </header>
  )
}
