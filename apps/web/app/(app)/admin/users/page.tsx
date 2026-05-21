'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Shield, User as UserIcon, Users } from 'lucide-react';
import styles from '../admin.module.css';
import { Skeleton, EmptyState } from '@sololearning/ui';
import { useToast } from '../../../../components/ToastProvider';

interface User {
  id: string;
  email: string;
  username: string;
  xp: number;
  streak: number;
  rank: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    xp: 0,
    streak: 0,
    rank: 'Newbie',
    role: 'USER',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lower = search.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) => u.username.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower),
        ),
      );
    }
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      toast.error('Network error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (
      !window.confirm(
        `Are you sure you want to completely delete user ${username}? This action cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(`User ${username} deleted`);
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (err) {
      toast.error('Network error deleting user');
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      xp: user.xp,
      streak: user.streak,
      rank: user.rank,
      role: user.role,
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error('Failed to update user');
      }
    } catch (err) {
      toast.error('Network error updating user');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '20px' }}>
        <Skeleton height="50px" borderRadius="12px" style={{ marginBottom: '20px' }} />
        <Skeleton height="400px" borderRadius="12px" />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderActions}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>User Moderation</h3>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                color: 'var(--color-text-light)',
              }}
            />
            <input
              type="text"
              className={styles.searchInput}
              style={{ paddingLeft: '36px' }}
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Status / Role</th>
                <th>Progression</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<Users size={32} />}
                      title="No Users Found"
                      description="No users matched your current search query."
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          className={styles.avatarPlaceholder}
                          style={{ width: '36px', height: '36px', fontSize: '13px' }}
                        >
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '15px' }}>
                            {user.username}
                          </span>
                          <span style={{ color: 'var(--color-text-light)', fontSize: '13px' }}>
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {user.role === 'ADMIN' ? (
                          <span
                            className={styles.badge}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Shield size={12} /> Admin
                          </span>
                        ) : (
                          <span
                            className={styles.badge}
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              color: '#60a5fa',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <UserIcon size={12} /> User
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                          {user.xp.toLocaleString()} XP{' '}
                          <span style={{ color: 'var(--color-text-light)', fontWeight: 'normal' }}>
                            (Rank: {user.rank})
                          </span>
                        </span>
                        <span style={{ fontSize: '13px', color: '#f59e0b' }}>
                          🔥 {user.streak} day streak
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--color-text-light)' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          className={`${styles.actionBtn} ${styles.btnSecondary}`}
                          onClick={() => openEdit(user)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.btnDanger}`}
                          onClick={() => handleDelete(user.id, user.username)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL OVERLAY */}
      {editingUser && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={saveEdit}>
            <div className={styles.modalHeader}>
              <h3>Edit User: {editingUser.username}</h3>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.btnSecondary}`}
                onClick={() => setEditingUser(null)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>XP</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={editForm.xp}
                  onChange={(e) => setEditForm({ ...editForm, xp: Number(e.target.value) })}
                  required
                />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Active Streak (Days)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={editForm.streak}
                  onChange={(e) => setEditForm({ ...editForm, streak: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Rank Display Title</label>
              <input
                className={styles.formInput}
                type="text"
                value={editForm.rank}
                onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Privilege Role</label>
              <select
                className={styles.formSelect}
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="USER">Standard User</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.btnSecondary}`}
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button type="submit" className={`${styles.actionBtn} ${styles.btnPrimary}`}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
