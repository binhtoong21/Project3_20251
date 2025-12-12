import React from 'react'

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <main className="admin-main">
        {children}
      </main>
    </div>
    )
}