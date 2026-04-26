import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Package, Camera, Tag, Type, Save, X, ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'

import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../api'
import ProductSort from '../components/ProductSort'
import '../styles/ProductsStyle.css'

const EMPTY_FORM = { name: '', price: '', imageFile: null, imagePreview: null }
const EMPTY_PRODUCTS = []

export default function ProductsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const products = data?.data || EMPTY_PRODUCTS

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [sort, setSort] = useState('name-asc')

  // —— CLIENT-SIDE SORT ——
  const sortedProducts = useMemo(() => {
    const arr = [...products]
    switch (sort) {
      case 'price-asc': return arr.sort((a, b) => a.price - b.price)
      case 'price-desc': return arr.sort((a, b) => b.price - a.price)
      case 'name-asc': return arr.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc': return arr.sort((a, b) => b.name.localeCompare(a.name))
      default: return arr
    }
  }, [products, sort])

  const saveMutation = useMutation({
    mutationFn: async (d) => {
      const res = editing
        ? await updateProduct(editing.id, { name: d.name, price: d.price })
        : await createProduct({ name: d.name, price: d.price })
      if (d.imageFile) {
        await uploadProductImage(res.data.id, d.imageFile)
      }
      return res
    },
    onSuccess: () => {
      qc.invalidateQueries(['products'])
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      toast.success(editing ? t('products.toast.updated') : t('products.toast.added'))
    },
    onError: () => toast.error(t('products.toast.saveError')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries(['products'])
      toast.success(t('products.toast.deleted'))
    },
  })

  const imageMutation = useMutation({
    mutationFn: ({ id, file }) => uploadProductImage(id, file),
    onSuccess: () => {
      qc.invalidateQueries(['products'])
      toast.success(t('products.toast.photoUploaded'))
    },
  })

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name,
      price: p.price,
      imageFile: null,
      imagePreview: p.image_path
        ? `${import.meta.env.VITE_API_URL}/${p.image_path}`
        : null,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImagePick = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate({ name: form.name, price: parseFloat(form.price), imageFile: form.imageFile })
  }

  return (
    <div className="pr-root">
      {/* PAGE HEADER */}
      <div className="pr-header">
        <div className="pr-header-left">
          <div className="pr-header-icon">
            <Package size={18} strokeWidth={1.8} />
          </div>
          <div>
            <p className="pr-breadcrumb">{t('products.breadcrumb')}</p>
            <h1 className="pr-title">{t('products.title')}</h1>
          </div>
        </div>

        <button className="pr-btn-add" onClick={openAdd} type="button">
          <Plus size={15} strokeWidth={2.2} />
          {t('products.addProduct')}
        </button>
      </div>

      {/* FORM CARD */}
      {showForm && (
        <div className="pr-form-card">
          <div className="pr-form-header">
            <span className="pr-form-header-icon">
              {editing ? <Pencil size={13} strokeWidth={2.2} /> : <Plus size={13} strokeWidth={2.2} />}
            </span>
            <span className="pr-form-title">
              {editing ? t('products.form.editTitle') : t('products.form.newTitle')}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="pr-form-body">
            {/* IMAGE PICKER */}
            <div className="pr-img-picker-wrap">
              <label className="pr-img-picker" title={t('products.form.uploadPhoto')}>
                {form.imagePreview ? (
                  <img src={form.imagePreview} alt="preview" className="pr-img-picker-preview" />
                ) : (
                  <div className="pr-img-picker-empty">
                    <ImagePlus size={26} strokeWidth={1.4} />
                    <span>{t('products.form.addPhoto')}</span>
                  </div>
                )}
                <div className="pr-img-picker-overlay">
                  <Camera size={18} strokeWidth={1.8} />
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
              </label>
              {form.imagePreview && (
                <button
                  type="button"
                  className="pr-img-picker-remove"
                  onClick={() => setForm(f => ({ ...f, imageFile: null, imagePreview: null }))}
                  title={t('actions.cancel')}
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* FIELDS */}
            <div className="pr-form-fields">
              <div className="pr-form-field">
                <label className="pr-form-label">{t('products.form.name')}</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon"><Type size={13} strokeWidth={1.8} /></span>
                  <input
                    className="pr-input"
                    placeholder={t('products.form.namePlaceholder')}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="pr-form-field pr-form-field--sm">
                <label className="pr-form-label">{t('products.form.price')}</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon"><Tag size={13} strokeWidth={1.8} /></span>
                  <input
                    className="pr-input"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="pr-form-actions">
                <button type="submit" className="pr-btn-save" disabled={saveMutation.isPending}>
                  <Save size={14} strokeWidth={2} />
                  {saveMutation.isPending ? t('actions.saving') : t('actions.save')}
                </button>
                <button
                  type="button"
                  className="pr-btn-cancel"
                  onClick={() => { setShowForm(false); setEditing(null) }}
                  title={t('actions.cancel')}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SORT BAR */}
      {!isLoading && products.length > 0 && (
        <ProductSort currentSort={sort} onSortChange={setSort} />
      )}

      {/* PRODUCT GRID */}
      {isLoading ? (
        <p style={{ color: '#6b7db3', fontFamily: 'Sora, sans-serif', fontSize: 14 }}>
          {t('actions.loading')}
        </p>
      ) : (
        <div className="pr-grid">
          {sortedProducts.length === 0 ? (
            <div className="pr-empty">
              <div className="pr-empty-icon">
                <Package size={24} strokeWidth={1.5} />
              </div>
              <p className="pr-empty-text">{t('products.empty.title')}</p>
              <p className="pr-empty-sub">{t('products.empty.subtitle')}</p>
            </div>
          ) : (
            sortedProducts.map((p, i) => (
              <div className="pr-card" key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="pr-img-wrap">
                  {p.image_path ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${p.image_path}`}
                      alt={p.name}
                      className="pr-img"
                    />
                  ) : (
                    <div className="pr-img-placeholder">
                      <Package size={36} strokeWidth={1.2} />
                    </div>
                  )}
                  <label className="pr-img-upload" title={t('products.form.uploadPhoto')}>
                    <Camera size={12} strokeWidth={2} />
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => e.target.files[0] && imageMutation.mutate({ id: p.id, file: e.target.files[0] })}
                    />
                  </label>
                </div>

                <div className="pr-card-body">
                  <div className="pr-card-name" title={p.name}>{p.name}</div>
                  <div className="pr-card-price">{p.price.toFixed(2)} €</div>
                  <div className="pr-card-actions">
                    <button className="pr-btn-edit" onClick={() => openEdit(p)} type="button">
                      <Pencil size={12} strokeWidth={2} /> {t('actions.edit')}
                    </button>
                    <button
                      className="pr-btn-delete"
                      onClick={() => deleteMutation.mutate(p.id)}
                      disabled={deleteMutation.isPending}
                      type="button"
                    >
                      <Trash2 size={12} strokeWidth={2} /> {t('actions.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
