import React from 'react'
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}