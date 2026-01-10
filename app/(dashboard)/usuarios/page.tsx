'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Loader2, AlertCircle, RefreshCw, X, Save } from 'lucide-react';
import { usersAPI, UserDTO } from '@/lib/api';

// Validar cédula ecuatoriana
const validateCedulaEcuatoriana = (cedula: string): { valid: boolean; message: string } => {
  // Debe tener 10 dígitos
  if (!/^\d{10}$/.test(cedula)) {
    return { valid: false, message: 'La cédula debe tener 10 dígitos numéricos' };
  }

  // Los primeros 2 dígitos son el código de provincia (01-24)
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) {
    return { valid: false, message: 'Código de provincia inválido (debe ser 01-24)' };
  }

  // El tercer dígito debe ser menor a 6
  const tercerDigito = parseInt(cedula.charAt(2), 10);
  if (tercerDigito > 5) {
    return { valid: false, message: 'El tercer dígito es inválido' };
  }

  // Algoritmo de validación módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula.charAt(9), 10);
  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  if (resultado !== digitoVerificador) {
    return { valid: false, message: 'Cédula inválida' };
  }

  return { valid: true, message: '' };
};

// Validar contraseña segura
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos 1 mayúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Al menos 1 número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password)) {
    errors.push('Al menos 1 carácter especial (!@#$%^&*...)');
  }
  
  return { valid: errors.length === 0, errors };
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [cedulaError, setCedulaError] = useState<string>('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<UserDTO>({
    name: '',
    lastname: '',
    cedula: '',
    username: '',
    roleName: 'USER',
  });

  // Cargar usuarios desde el backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersAPI.getAll();
      setUsers(response.users);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cedula.includes(searchTerm)
  );

  // Abrir modal para editar
  const handleEdit = (user: UserDTO) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      cedula: user.cedula,
      username: user.username,
      roleName: user.roleName,
    });
    setCedulaError('');
    setIsModalOpen(true);
  };

  // Abrir modal para crear nuevo usuario
  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      lastname: '',
      cedula: '',
      username: '',
      password: '',
      roleName: 'USER',
    });
    setCedulaError('');
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setCedulaError('');
    setFormData({
      name: '',
      lastname: '',
      cedula: '',
      username: '',
      roleName: 'USER',
    });
    setPasswordErrors([]);
  };

  // Guardar usuario (crear o actualizar)
  const handleSave = async () => {
    // Validar cédula antes de guardar
    const cedulaValidation = validateCedulaEcuatoriana(formData.cedula);
    if (!cedulaValidation.valid) {
      setCedulaError(cedulaValidation.message);
      return;
    }

    // Validar contraseña: requerida para nuevos usuarios, opcional para edición
    if (!editingUser) {
      // Nuevo usuario: contraseña requerida
      const passwordValidation = validatePassword(formData.password || '');
      if (!passwordValidation.valid) {
        setPasswordErrors(passwordValidation.errors);
        return;
      }
    } else if (formData.password && formData.password.length > 0) {
      // Editando usuario: si se ingresa contraseña, debe ser válida
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        setPasswordErrors(passwordValidation.errors);
        return;
      }
    }

    try {
      setSaving(true);
      
      if (editingUser) {
        // Actualizar usuario existente
        const updatedUser = await usersAPI.update(formData);
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      } else {
        // Crear nuevo usuario
        const newUser = await usersAPI.create(formData);
        setUsers([...users, newUser]);
      }
      
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving user:', err);
      alert(err.response?.data?.error || 'Error al guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    
    try {
      await usersAPI.delete(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert('Error al eliminar el usuario');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="truncate">Gestión de Usuarios</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <button 
          onClick={handleNewUser}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white text-sm sm:text-base"
          />
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors text-sm sm:text-base"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span className="sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
          <button 
            onClick={fetchUsers}
            className="sm:ml-auto px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
        </div>
      )}

      {/* Users Table/Cards */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="block sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <div key={user.id || `user-${index}`} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.name} {user.lastname}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => user.id && handleDelete(user.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">CI: {user.cedula}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                        user.roleName === 'ADMIN' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : user.roleName === 'VIEWER'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : user.roleName === 'APPROVER'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                        {user.roleName === 'ADMIN' ? 'Admin' 
                          : user.roleName === 'USER' ? 'Usuario'
                          : user.roleName === 'VIEWER' ? 'Viewer'
                          : user.roleName === 'APPROVER' ? 'Aprobador'
                          : user.roleName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Usuario</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nombre Completo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cédula</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Rol</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user, index) => (
                      <tr key={user.id || `user-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {user.name} {user.lastname}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {user.cedula}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                            user.roleName === 'ADMIN' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              : user.roleName === 'VIEWER'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : user.roleName === 'APPROVER'
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          }`}>
                            {user.roleName === 'ADMIN' ? 'Administrador' 
                              : user.roleName === 'USER' ? 'Usuario'
                              : user.roleName === 'VIEWER' ? 'Visualizador'
                              : user.roleName === 'APPROVER' ? 'Aprobador'
                              : user.roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => user.id && handleDelete(user.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal de Edición/Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      placeholder="Ingrese el nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.lastname}
                      onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      placeholder="Ingrese el apellido"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cédula
                    {editingUser && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                        (No editable)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => {
                      if (editingUser) return; // No permitir cambios en modo edición
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, cedula: value });
                      if (value.length === 10) {
                        const validation = validateCedulaEcuatoriana(value);
                        setCedulaError(validation.valid ? '' : validation.message);
                      } else if (value.length > 0) {
                        setCedulaError('La cédula debe tener 10 dígitos');
                      } else {
                        setCedulaError('');
                      }
                    }}
                    disabled={!!editingUser}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white ${
                      editingUser
                        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75 border-gray-300 dark:border-gray-600'
                        : `bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 ${
                            cedulaError 
                              ? 'border-red-500 dark:border-red-500' 
                              : formData.cedula.length === 10 
                                ? 'border-green-500 dark:border-green-500' 
                                : 'border-gray-200 dark:border-gray-700'
                          }`
                    }`}
                    placeholder="Ingrese la cédula"
                    maxLength={10}
                  />
                  {!editingUser && cedulaError && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {cedulaError}
                    </p>
                  )}
                  {!editingUser && !cedulaError && formData.cedula.length === 10 && (
                    <p className="mt-1 text-sm text-green-500">
                      ✓ Cédula válida
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="Ingrese el nombre de usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                  </label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, password: value });
                      if (value.length > 0) {
                        const validation = validatePassword(value);
                        setPasswordErrors(validation.errors);
                      } else {
                        setPasswordErrors([]);
                      }
                    }}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white ${
                      passwordErrors.length > 0
                        ? 'border-red-500 dark:border-red-500'
                        : formData.password && formData.password.length > 0
                          ? 'border-green-500 dark:border-green-500'
                          : 'border-gray-200 dark:border-gray-700'
                    }`}
                    placeholder={editingUser ? 'Dejar vacío para mantener la actual' : '••••••••'}
                  />
                  {editingUser && !formData.password && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Si no deseas cambiar la contraseña, deja este campo vacío
                    </p>
                  )}
                  {/* Indicadores de requisitos - solo mostrar si hay texto */}
                  {formData.password && formData.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className={`text-xs flex items-center gap-1 ${
                        (formData.password?.length || 0) >= 8 ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {(formData.password?.length || 0) >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${
                        /[A-Z]/.test(formData.password || '') ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {/[A-Z]/.test(formData.password || '') ? '✓' : '○'} Al menos 1 mayúscula
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${
                        /[0-9]/.test(formData.password || '') ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {/[0-9]/.test(formData.password || '') ? '✓' : '○'} Al menos 1 número
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${
                        /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/\`~]/.test(formData.password || '') ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/\`~]/.test(formData.password || '') ? '✓' : '○'} Al menos 1 carácter especial
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  >
                    <option value="USER">Usuario</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="VIEWER">Visualizador</option>
                    <option value="APPROVER">Aprobador</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.lastname || !formData.cedula || !formData.username}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
