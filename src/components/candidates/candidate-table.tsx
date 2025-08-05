'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useSheetCandidates, useCreateSheetCandidate, useUpdateSheetCandidate } from '@/lib/hooks/use-sheet-candidates'

interface CandidateTableProps {
  clientName: string
  jobTitle: string
}

interface CandidateRow {
  id: string
  candidateName: string
  email: string
  phone: string
  experience: string
  skills: string
  currentCompany: string
  currentSalary: string
  expectedSalary: string
  noticePeriod: string
  status: string
  linkedinUrl: string
  notes: string
  isTemp?: boolean
}

export default function CandidateTable({ clientName, jobTitle }: CandidateTableProps) {
  const [editingCell, setEditingCell] = useState<{row: number, column: string} | null>(null)
  const [visibleRows, setVisibleRows] = useState(10)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null)

  const isLocked = !clientName || !jobTitle
  const { data: fetchedCandidates = [], isLoading, error } = useSheetCandidates(clientName, jobTitle)
  const createCandidate = useCreateSheetCandidate()
  const updateCandidate = useUpdateSheetCandidate()

  // Create stable empty rows with consistent IDs
  const [stableEmptyRows, setStableEmptyRows] = useState<CandidateRow[]>([])
  
  // Create empty rows up to visible count
  const createEmptyRow = (index: number): CandidateRow => ({
    id: `empty-${clientName || 'default'}-${jobTitle || 'default'}-row-${index}`,
    candidateName: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    currentCompany: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '',
    status: 'New',
    linkedinUrl: '',
    notes: '',
    isTemp: true
  })

  // Reset empty rows when client/job changes and ensure 10 rows are always visible
  useEffect(() => {
    setVisibleRows(10) // Always reset to 10 rows
    setEditedData({}) // Clear any temporary edits
    
    // Create initial 10 empty rows immediately
    const initialRows = []
    for (let i = 0; i < 10; i++) {
      initialRows.push(createEmptyRow(i))
    }
    setStableEmptyRows(initialRows)
  }, [clientName, jobTitle])

  // Update stable empty rows when needed (but preserve existing ones)
  useEffect(() => {
    const neededEmptyRows = Math.max(10, visibleRows - fetchedCandidates.length) // Always at least 10 rows
    
    setStableEmptyRows(prev => {
      // If we need more rows than we have, add them
      if (neededEmptyRows > prev.length) {
        const newRows = []
        for (let i = prev.length; i < neededEmptyRows; i++) {
          newRows.push(createEmptyRow(fetchedCandidates.length + i))
        }
        return [...prev, ...newRows]
      }
      // If we need fewer rows, trim them (but never go below 10)
      else if (neededEmptyRows < prev.length && neededEmptyRows >= 10) {
        return prev.slice(0, neededEmptyRows)
      }
      // If we need the same number, keep existing
      return prev
    })
  }, [visibleRows, fetchedCandidates.length])

  // Create stable local data using useMemo instead of useEffect
  const localData = useMemo(() => {
    const rows: CandidateRow[] = []
    
    // Add fetched candidates first
    fetchedCandidates.forEach(candidate => {
      rows.push({
        id: candidate.id,
        candidateName: candidate.candidateName,
        email: candidate.email,
        phone: '',
        experience: '',
        skills: '',
        currentCompany: '',
        currentSalary: '',
        expectedSalary: '',
        noticePeriod: '',
        status: candidate.status,
        linkedinUrl: '',
        notes: '',
        isTemp: false
      })
    })
    
    // Always ensure we have at least 10 rows total
    const emptyRowsNeeded = Math.max(10 - fetchedCandidates.length, 0)
    const emptyRowsToAdd = stableEmptyRows.slice(0, emptyRowsNeeded)
    
    // If we don't have enough stable empty rows, create them on the fly
    if (emptyRowsToAdd.length < emptyRowsNeeded) {
      for (let i = emptyRowsToAdd.length; i < emptyRowsNeeded; i++) {
        emptyRowsToAdd.push(createEmptyRow(fetchedCandidates.length + i))
      }
    }
    
    rows.push(...emptyRowsToAdd)
    
    // Always ensure we have at least 10 rows
    while (rows.length < 10) {
      rows.push(createEmptyRow(rows.length))
    }
    
    return rows
  }, [fetchedCandidates, stableEmptyRows, visibleRows])

  // Separate state for temporary edits
  const [editedData, setEditedData] = useState<Record<string, CandidateRow>>({})
  
  // Get the current data (base + edits) - memoized for stability
  const currentData = useMemo(() => {
    return localData.map(row => editedData[row.id] || row)
  }, [localData, editedData])

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingCell])

  const handleAdd10Rows = () => {
    setVisibleRows(prev => prev + 10)
  }

  const handleCellClick = (rowIndex: number, column: string) => {
    if (isLocked) return // Prevent editing when locked
    setEditingCell({ row: rowIndex, column })
  }

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    if (isLocked) return // Prevent changes when locked
    
    const row = currentData[rowIndex]
    if (!row) return
    
    const updatedRow = {
      ...row,
      [column]: value
    }
    
    setEditedData(prev => ({
      ...prev,
      [row.id]: updatedRow
    }))
  }

  const handleCellBlur = async (rowIndex: number, column: string) => {
    setEditingCell(null)
    if (isLocked) return
    
    const row = currentData[rowIndex]
    if (!row) return
    
    // If this is an empty/temp row and has data, save it
    if (row.isTemp && (row.candidateName.trim() || row.email.trim())) {
      // Only save if we have at least name and email
      if (row.candidateName.trim() && row.email.trim()) {
        try {
          const savedCandidate = await createCandidate.mutateAsync({
            candidateName: row.candidateName,
            email: row.email,
            status: row.status,
            clientName,
            jobTitle,
          })
      
          // Update stable empty rows so the saved candidate stays in place
            setStableEmptyRows(prev => prev.map(r => r.id === row.id ? { ...r, ...savedCandidate, isTemp: false } : r))
            // Clear the edited data for this row since it's now saved
            setEditedData(prev => {
              const newData = { ...prev }
              delete newData[row.id]
              return newData
            })
    } catch (error) {
          console.error('Failed to save candidate:', error)
          alert('Failed to save candidate')
        }
      }
    } else if (!row.isTemp) {
      // Update existing candidate
    try {
      const updated = await updateCandidate.mutateAsync({
          id: row.id,
          candidateName: row.candidateName,
          email: row.email,
          status: row.status,
        })
        // reflect locally
        setStableEmptyRows(prev => prev.map(r => r.id === row.id ? { ...r, ...updated, isTemp: false } : r))
    } catch (error) {
      console.error('Failed to update candidate:', error)
      alert('Failed to update candidate')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, rowIndex: number, column: string) => {
    if (e.key === 'Enter') {
      handleCellBlur(rowIndex, column)
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      // Revert the cell to original value
      if (!isLocked) {
        const row = currentData[rowIndex]
        if (row && editedData[row.id]) {
          // Remove the edited version to revert to original
          setEditedData(prev => {
            const newData = { ...prev }
            delete newData[row.id]
            return newData
          })
        }
      }
    }
  }

  const columns = [
    { key: 'candidateName', label: '👤 Candidate Name', width: '180px', priority: 'high' },
    { key: 'email', label: '📧 Email', width: '200px', priority: 'high' },
    { key: 'phone', label: '📱 Phone', width: '140px', priority: 'medium' },
    { key: 'experience', label: '⏱️ Experience', width: '120px', priority: 'high' },
    { key: 'skills', label: '🛠️ Skills', width: '220px', priority: 'high' },
    { key: 'currentCompany', label: '🏢 Current Company', width: '180px', priority: 'medium' },
    { key: 'currentSalary', label: '💰 Current Salary', width: '140px', priority: 'high' },
    { key: 'expectedSalary', label: '💵 Expected Salary', width: '140px', priority: 'high' },
    { key: 'noticePeriod', label: '📅 Notice Period', width: '130px', priority: 'medium' },
    { key: 'status', label: '📊 Status', width: '140px', priority: 'high' },
    { key: 'linkedinUrl', label: '🔗 LinkedIn', width: '130px', priority: 'low' },
    { key: 'notes', label: '📝 Notes', width: '250px', priority: 'medium' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
      case 'Interviewing':
        return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
      case 'Offered':
        return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
      case 'Hired':
        return 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)'
      case 'Rejected':
        return 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)'
      case 'Not Interested':
        return 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
      default:
        return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'New':
        return '#1e40af'
      case 'Interviewing':
        return '#d97706'
      case 'Offered':
        return '#059669'
      case 'Hired':
        return '#047857'
      case 'Rejected':
        return '#dc2626'
      case 'Not Interested':
        return '#7c3aed'
      default:
        return '#64748b'
    }
  }

  // Get row background color based on status
  const getRowBackgroundColor = (status: string, isTemp: boolean, rowIndex: number) => {
    if (isTemp) {
      return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
    }
    
    switch (status) {
      case 'New':
        return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
      case 'Interviewing':
        return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
      case 'Offered':
        return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
      case 'Hired':
        return 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)'
      case 'Rejected':
        return 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)'
      case 'Not Interested':
        return 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
      default:
        return rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc'
    }
  }

  // Get row hover color based on status
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getRowHoverColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)'
      case 'Interviewing':
        return 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)'
      case 'Offered':
        return 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)'
      case 'Hired':
        return 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)'
      case 'Rejected':
        return 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)'
      case 'Not Interested':
        return 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)'
      default:
        return 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)'
    }
  }

  const renderCell = (row: CandidateRow, _column: { key: string; label: string; width: string; icon?: React.ReactNode }, rowIndex: number) => {
    const isEditing = editingCell?.row === rowIndex && editingCell?.column === _column.key
    const value = row[_column.key as keyof CandidateRow] || ''

    // Modern cell styling
    const cellStyle = {
      width: '100%',
      height: '100%',
      padding: '12px 16px',
      border: 'none',
      outline: 'none',
      fontSize: '14px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: 'transparent',
      color: '#1e293b',
      resize: 'none' as const,
      borderRadius: '4px'
    }

    const displayStyle = {
      padding: '12px 16px',
      minHeight: _column.key === 'notes' ? '56px' : '44px',
      cursor: isLocked ? 'not-allowed' : 'pointer',
      color: isLocked ? '#94a3b8' : '#1e293b',
      fontSize: '14px',
      fontWeight: '500',
      wordBreak: 'break-word' as const,
      background: 'transparent',
      opacity: isLocked ? 0.6 : 1,
      display: 'flex',
      alignItems: _column.key === 'notes' ? 'flex-start' : 'center',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    }

    if (_column.key === 'status') {
      if (isEditing && !isLocked) {
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value as string}
            onChange={(e) => handleCellChange(rowIndex, _column.key, e.target.value)}
            onBlur={() => handleCellBlur(rowIndex, _column.key)}
            onKeyDown={(e) => handleKeyPress(e, rowIndex, _column.key)}
            style={{
              ...cellStyle,
              cursor: 'pointer',
              background: 'white',
              border: '2px solid #3b82f6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
          >
            <option value="New">New</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        )
      } else {
        return (
          <div style={displayStyle}>
            {value ? (
              <span style={{
                background: getStatusColor(value as string),
                color: getStatusTextColor(value as string),
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: '2px solid transparent',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                {value}
              </span>
            ) : (
              <span style={{
                color: '#94a3b8',
                fontSize: '13px',
                fontStyle: 'italic'
              }}>
                Click to set status
              </span>
            )}
          </div>
        )
      }
    }

    if (_column.key === 'notes') {
      if (isEditing && !isLocked) {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value as string}
            onChange={(e) => handleCellChange(rowIndex, _column.key, e.target.value)}
            onBlur={() => handleCellBlur(rowIndex, _column.key)}
            onKeyDown={(e) => handleKeyPress(e, rowIndex, _column.key)}
            style={{
              ...cellStyle,
              minHeight: '56px',
              background: 'white',
              border: '2px solid #3b82f6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            placeholder="Add notes about this candidate..."
          />
        )
      } else {
        return (
          <div style={displayStyle}>
            {value || (
              <span style={{
                color: '#94a3b8',
                fontSize: '13px',
                fontStyle: 'italic'
              }}>
                Click to add notes
              </span>
            )}
          </div>
        )
      }
    }

    if (isEditing && !isLocked) {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value as string}
          onChange={(e) => handleCellChange(rowIndex, _column.key, e.target.value)}
          onBlur={() => handleCellBlur(rowIndex, _column.key)}
          onKeyDown={(e) => handleKeyPress(e, rowIndex, _column.key)}
          style={{
            ...cellStyle,
            background: 'white',
            border: '2px solid #3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          placeholder={`Enter ${_column.label.toLowerCase()}...`}
        />
      )
    }

    return (
      <div style={displayStyle}>
        {value || (
          <span style={{
            color: '#94a3b8',
            fontSize: '13px',
            fontStyle: 'italic'
          }}>
            Click to edit
          </span>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ color: 'white', textAlign: 'center' }}>Loading candidates...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ color: 'rgba(239, 68, 68, 0.9)', textAlign: 'center' }}>
          Error loading candidates. Please try again.
        </div>
      </div>
    )
  }

  return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
      {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0,
            marginBottom: '4px'
          }}>
            Candidate Sheet
          </h3>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0
          }}>
            {clientName && jobTitle ? (
              <div style={{
                fontSize: '16px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {clientName} - {jobTitle}
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                animation: 'pulse 2s infinite'
              }}>
                <span style={{
                  fontSize: '24px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}>
                  🔒
                </span>
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'rgba(255, 255, 255, 0.95)',
                    marginBottom: '4px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    Sheet Locked
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500'
                  }}>
                    Select a client and job role above to unlock editing
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
          <button
          onClick={handleAdd10Rows}
          disabled={isLocked}
            style={{
            background: isLocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            color: isLocked ? 'rgba(255, 255, 255, 0.5)' : 'white',
              padding: '8px 16px',
              borderRadius: '6px',
            cursor: isLocked ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
          Add 10 More Rows
          </button>
        </div>

            {/* Modern Candidate Table */}
      <div style={{
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        position: 'relative',
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}>
        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <span>↔️</span>
          <span>Scroll to see all columns</span>
        </div>
        
        {/* Scrollable container with visible scrollbars */}
        <div style={{
          maxHeight: '600px',
          overflowY: 'auto',
          overflowX: 'auto',
          position: 'relative'
        }} 
        className="table-scrollbar">
          <style jsx>{`
            .table-scrollbar::-webkit-scrollbar {
              width: 12px;
              height: 12px;
            }
            .table-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 6px;
            }
            .table-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              border-radius: 6px;
              border: 2px solid #f1f5f9;
            }
            .table-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            }
            .table-scrollbar::-webkit-scrollbar-corner {
              background: #f1f5f9;
            }
            
            /* Firefox scrollbar styling */
            .table-scrollbar {
              scrollbar-width: auto;
              scrollbar-color: #3b82f6 #f1f5f9;
            }
            
            @keyframes pulse {
              0%, 100% {
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
              }
              50% {
                box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
              }
            }
          `}</style>
          
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            minWidth: '1400px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
              }}>
                <th style={{
                  padding: '18px 12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  width: '60px',
                  borderRight: '2px solid rgba(255, 255, 255, 0.3)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  #
                </th>
                                {columns.map((_column, index) => (
                  <th key={_column.key} style={{
                    padding: '18px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                    fontWeight: '700',
                    width: _column.width,
                    minWidth: _column.width,
                    borderRight: index < columns.length - 1 ? '2px solid rgba(255, 255, 255, 0.3)' : 'none',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase'
                  }}>
                    {_column.label}
                </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, rowIndex) => {
                const rowBgColor = getRowBackgroundColor(row.status, !!row.isTemp, rowIndex)
                const statusTextColor = getStatusTextColor(row.status)
                
                return (
                <tr key={row.id} style={{
                  background: rowBgColor,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  border: row.status && row.status !== 'New' ? `2px solid ${statusTextColor}60` : '1px solid rgba(226, 232, 240, 0.5)',
                  boxShadow: row.status && row.status !== 'New' ? `0 4px 8px ${statusTextColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.5)` : '0 1px 3px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  margin: '2px 0'
                }}
                onMouseEnter={(e) => {
                  if (!isLocked) {
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.01)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = `0 12px 24px ${statusTextColor}40, 0 6px 12px rgba(0, 0, 0, 0.15)`
                    ;(e.currentTarget as HTMLElement).style.filter = 'brightness(1.05) saturate(1.1)'
                    ;(e.currentTarget as HTMLElement).style.zIndex = '5'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLocked) {
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = row.status && row.status !== 'New' ? `0 4px 8px ${statusTextColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.5)` : '0 1px 3px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    ;(e.currentTarget as HTMLElement).style.filter = 'brightness(1) saturate(1)'
                    ;(e.currentTarget as HTMLElement).style.zIndex = '1'
                  }
                }}>
                                <td style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#1e293b',
                  fontWeight: '600',
                  width: '50px',
                  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'transparent'
                }}>
                  {rowIndex + 1}
                </td>
                                {columns.map((column, colIndex) => (
                  <td key={column.key} style={{
                    padding: '0',
                    borderRight: colIndex < columns.length - 1 ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                    width: column.width,
                    minWidth: column.width,
                    maxWidth: column.width,
                    verticalAlign: 'top',
                    background: 'inherit'
                  }}>
                    <div
                      onClick={() => handleCellClick(rowIndex, column.key)}
                      style={{
                        minHeight: column.key === 'notes' ? '60px' : '48px',
                        border: editingCell?.row === rowIndex && editingCell?.column === column.key 
                          ? '2px solid #3b82f6' 
                          : '2px solid transparent',
                        borderRadius: '4px',
                        margin: '2px',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        background: 'transparent'
                      }}
                    >
                      {renderCell(row, column, rowIndex)}
                    </div>
                  </td>
                ))}
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Status Bar */}
      <div style={{
        marginTop: '20px',
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(59, 130, 246, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <span>📊</span>
            <span><strong>{visibleRows}</strong> rows visible</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(34, 197, 94, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <span>✅</span>
            <span><strong>{currentData.filter(r => !r.isTemp).length}</strong> saved</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <span>✏️</span>
            <span><strong>{currentData.filter(r => r.isTemp && (r.candidateName || r.email)).length}</strong> drafts</span>
          </div>
        </div>
        
        <div style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isLocked ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              <span>🔒</span>
              <span>Select client and job role to unlock editing</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'rgba(16, 185, 129, 0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              <span>🎯 Click cells to edit</span>
              <span>⏎ Enter to save</span>
              <span>⎋ Escape to cancel</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 