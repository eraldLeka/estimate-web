import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, FileText, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

import { getProducts, createPreventiv } from '../api'
import '../styles/NewPreventiveStyle.css'

export default function NewPreventivPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const products = data?.data || []

  const [clientName, setClientName] = useState('')
  const [items, setItems] = useState([])

  const mutation = useMutation({
    mutationFn: createPreventiv,
    onSuccess: (res) => {
      toast.success(t('newPreventive.toast.created'))
      navigate(`/preventiva/${res.data.id}`)
    },
    onError: () => toast.error(t('newPreventive.toast.createError')),
  })

  const addItem = (product) => {
    if (items.find(i => i.product_id === product.id)) {
      return toast.error(t('newPreventive.toast.alreadyAdded'))
    }
    setItems(prev => [
      ...prev,
      {
        product_id: product.id,
        name_snapshot: product.name,
        price_snapshot: product.price,
        image_snapshot: product.image_path,
        quantity: 1,
      },
    ])
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.product_id !== id))

  const updateQty = (id, qty) => {
    const value = parseInt(qty, 10)
    setItems(prev =>
      prev.map(i =>
        i.product_id === id
          ? { ...i, quantity: value > 0 ? value : 1 }
          : i
      )
    )
  }

  const grandTotal = items.reduce((s, i) => s + i.price_snapshot * i.quantity, 0)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!clientName.trim()) return toast.error(t('newPreventive.toast.missingClient'))
    if (items.length === 0) return toast.error(t('newPreventive.toast.missingItems'))

    mutation.mutate({
      client_name: clientName,
      items,
      total: grandTotal,
    })
  }

  return (
    <div className="pv-root">
      <div className="pv-main">
        <form onSubmit={handleSubmit}>
          {/* HEADER */}
          <div className="pv-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="pv-header-icon">
                <FileText size={18} strokeWidth={1.8} />
              </div>
              <div>
                <p className="pv-breadcrumb">
                  {t('newPreventive.breadcrumb.root')} <ChevronRight size={12} /> {t('newPreventive.breadcrumb.create')}
                </p>
                <h1 className="pv-title">{t('newPreventive.title')}</h1>
              </div>
            </div>

            <button
              type="submit"
              className="pv-submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? t('actions.creating') : t('newPreventive.submit')}
            </button>
          </div>

          {/* CLIENT NAME */}
          <div className="pv-card">
            <span className="pv-card-label">{t('newPreventive.clientName')}</span>
            <input
              className="pv-input"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder={t('newPreventive.clientNamePlaceholder')}
            />
          </div>

          {/* ITEMS TABLE */}
          {items.length > 0 ? (
            <div className="pv-card pv-card--table">
              <span className="pv-card-label">{t('newPreventive.selectedItems')}</span>

              <table className="pv-table">
                <thead>
                  <tr>
                    <th className="pv-th" style={{ width: 56 }}>{t('newPreventive.table.photo')}</th>
                    <th className="pv-th">{t('newPreventive.table.name')}</th>
                    <th className="pv-th pv-th--center" style={{ width: 96 }}>{t('newPreventive.table.quantity')}</th>
                    <th className="pv-th pv-th--right">{t('newPreventive.table.price')}</th>
                    <th className="pv-th pv-th--right">{t('newPreventive.table.value')}</th>
                    <th className="pv-th" style={{ width: 48 }} />
                  </tr>
                </thead>

                <tbody>
                  {items.map(item => (
                    <tr className="pv-tr" key={item.product_id}>
                      {/* FOTO */}
                      <td className="pv-td">
                        {item.image_snapshot ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/${item.image_snapshot}`}
                            className="pv-img"
                            alt={item.name_snapshot}
                          />
                        ) : (
                          <div className="pv-img-placeholder" />
                        )}
                      </td>

                      {/* EMËRTIMI */}
                      <td className="pv-td pv-td--name">{item.name_snapshot}</td>

                      {/* SASIA */}
                      <td className="pv-td pv-td--center">
                        <div className="pv-qty-container">
                          <button
                            type="button"
                            className="pv-qty-btn"
                            onClick={() => updateQty(item.product_id, Math.max(1, Number(item.quantity) - 1))}
                          >
                            −
                          </button>

                          <input
                            type="number"
                            className="pv-qty"
                            min="1"
                            value={item.quantity}
                            onChange={e => updateQty(item.product_id, e.target.value)}
                          />

                          <button
                            type="button"
                            className="pv-qty-btn"
                            onClick={() => updateQty(item.product_id, Number(item.quantity) + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* ÇMIMI */}
                      <td className="pv-td pv-td--right pv-td--price">
                        {item.price_snapshot.toFixed(2)} €
                      </td>

                      {/* VLERA */}
                      <td className="pv-td pv-td--right pv-td--value">
                        {(item.price_snapshot * item.quantity).toFixed(2)} €
                      </td>

                      {/* DELETE */}
                      <td className="pv-td pv-td--action">
                        <button
                          type="button"
                          className="pv-trash"
                          onClick={() => removeItem(item.product_id)}
                          title={t('newPreventive.table.remove')}
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pv-total-row">
                <span className="pv-total-label">{t('newPreventive.total')}</span>
                <span className="pv-total-amount">{grandTotal.toFixed(2)} €</span>
              </div>
            </div>
          ) : (
            <div className="pv-empty">
              <div className="pv-empty-icon">
                <FileText size={24} strokeWidth={1.5} />
              </div>
              <p className="pv-empty-text">{t('newPreventive.empty.title')}</p>
              <p className="pv-empty-sub">{t('newPreventive.empty.subtitle')}</p>
            </div>
          )}
        </form>
      </div>

      {/* SIDEBAR */}
      <div className="pv-sidebar">
        <div className="pv-sidebar-header">
          <span className="pv-sidebar-title">{t('newPreventive.sidebar.title')}</span>
          <span className="pv-sidebar-count">{products.length}</span>
        </div>

        <div className="pv-product-list">
          {productsLoading ? (
            <p style={{ padding: '12px 14px', color: '#6b7db3', fontSize: 13 }}>
              {t('actions.loading')}
            </p>
          ) : (
            products.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => addItem(p)}
                className={`pv-product-btn${items.find(i => i.product_id === p.id) ? ' pv-product-btn--added' : ''}`}
              >
                <div className="pv-product-info">
                  <span className="pv-product-name">{p.name}</span>
                  <span className="pv-product-price">{p.price.toFixed(2)} €</span>
                </div>
                <div className="pv-product-plus">
                  <Plus size={13} strokeWidth={2.2} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

