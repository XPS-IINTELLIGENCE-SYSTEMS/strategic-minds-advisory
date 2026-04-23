import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Plus, Trash2, Copy, Save, X, ChevronDown, Loader2,
  Database, Type, Check, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FIELD_TYPES = ['string', 'number', 'boolean', 'date', 'date-time', 'object', 'array'];

export default function SchemaEditor({ entityName = null, onClose }) {
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [editingSchema, setEditingSchema] = useState(null);
  const [newField, setNewField] = useState({ name: '', type: 'string' });
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [draggedField, setDraggedField] = useState(null);

  // Load entities
  useEffect(() => {
    const loadEntities = async () => {
      try {
        const files = await fetch('/api/entities').then(r => r.json());
        setEntities(files.map(f => ({ name: f.replace('.json', '') })));
      } catch {
        console.log('Using fallback entity list');
      }
    };
    loadEntities();
  }, []);

  // Load selected entity schema
  useEffect(() => {
    const loadSchema = async () => {
      if (!selectedEntity) return;
      try {
        const res = await fetch(`/api/entities/${selectedEntity.name}.json`);
        if (res.ok) {
          const schema = await res.json();
          setEditingSchema(schema);
        }
      } catch (error) {
        console.error('Failed to load schema:', error);
      }
    };
    loadSchema();
  }, [selectedEntity]);

  const addField = () => {
    if (!newField.name || !editingSchema) return;
    const updatedProps = {
      ...editingSchema.properties,
      [newField.name]: {
        type: newField.type,
        description: ''
      }
    };
    setEditingSchema(s => ({ ...s, properties: updatedProps }));
    setNewField({ name: '', type: 'string' });
  };

  const removeField = (fieldName) => {
    const updatedProps = { ...editingSchema.properties };
    delete updatedProps[fieldName];
    const updatedRequired = editingSchema.required?.filter(r => r !== fieldName) || [];
    setEditingSchema(s => ({
      ...s,
      properties: updatedProps,
      required: updatedRequired
    }));
  };

  const updateFieldType = (fieldName, newType) => {
    setEditingSchema(s => ({
      ...s,
      properties: {
        ...s.properties,
        [fieldName]: { ...s.properties[fieldName], type: newType }
      }
    }));
  };

  const toggleRequired = (fieldName) => {
    const isRequired = editingSchema.required?.includes(fieldName);
    const updatedRequired = isRequired
      ? editingSchema.required.filter(r => r !== fieldName)
      : [...(editingSchema.required || []), fieldName];
    setEditingSchema(s => ({ ...s, required: updatedRequired }));
  };

  const saveSchema = async () => {
    if (!editingSchema || !selectedEntity) return;
    setSyncing(true);
    setSyncStatus(null);

    try {
      // Sync to Supabase
      const syncRes = await base44.functions.invoke('syncSchemaToSupabase', {
        entityName: selectedEntity.name,
        schema: editingSchema,
      });

      setSyncStatus({
        type: 'success',
        message: `Schema synced to Supabase! Table: ${syncRes.data.tableName}`,
      });
    } catch (error) {
      setSyncStatus({
        type: 'error',
        message: `Sync failed: ${error.message}`,
      });
    }
    setSyncing(false);
  };

  const handleDragStart = (e, fieldName) => {
    setDraggedField(fieldName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetField) => {
    e.preventDefault();
    if (!draggedField || draggedField === targetField) return;

    const fields = Object.keys(editingSchema.properties);
    const dragIndex = fields.indexOf(draggedField);
    const targetIndex = fields.indexOf(targetField);

    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(targetIndex, 0, draggedField);

    const reorderedProps = {};
    newFields.forEach(f => {
      reorderedProps[f] = editingSchema.properties[f];
    });

    setEditingSchema(s => ({ ...s, properties: reorderedProps }));
    setDraggedField(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">Schema Editor</h2>
            <p className="text-sm text-muted-foreground mt-1">Drag-and-drop entity builder with Supabase sync</p>
          </div>
          {onClose && <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition"><X className="w-5 h-5" /></button>}
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Entity List */}
          <div className="md:col-span-1 p-5 rounded-2xl border border-border bg-card/50 h-fit space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Entities</div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {entities.map(e => (
                <button
                  key={e.name}
                  onClick={() => setSelectedEntity(e)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                    selectedEntity?.name === e.name
                      ? 'bg-accent/15 text-accent border border-accent'
                      : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>

          {/* Schema Editor */}
          {editingSchema && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-3 space-y-4"
            >
              {/* Entity Meta */}
              <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Entity Name</label>
                  <input
                    value={editingSchema.name}
                    onChange={e => setEditingSchema(s => ({ ...s, name: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition"
                  />
                </div>
              </div>

              {/* Fields */}
              <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Properties</div>
                  <span className="text-xs text-accent">{Object.keys(editingSchema.properties).length} fields</span>
                </div>

                <div className="space-y-2">
                  {Object.entries(editingSchema.properties).map(([fieldName, field]) => (
                    <motion.div
                      key={fieldName}
                      draggable
                      onDragStart={e => handleDragStart(e, fieldName)}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, fieldName)}
                      className="p-4 rounded-xl border border-border/50 bg-secondary/40 cursor-move hover:border-accent/30 transition group space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Type className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{fieldName}</span>
                        </div>
                        <button
                          onClick={() => toggleRequired(fieldName)}
                          className={`px-2 py-1 text-[10px] rounded-lg border transition ${
                            editingSchema.required?.includes(fieldName)
                              ? 'bg-accent/15 border-accent text-accent'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Required
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={field.type}
                          onChange={e => updateFieldType(fieldName, e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-accent transition"
                        >
                          {FIELD_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeField(fieldName)}
                          className="p-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-red-500/10 hover:border-red-500/30 transition text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Add Field */}
                <div className="pt-3 border-t border-border/50 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={newField.name}
                      onChange={e => setNewField(f => ({ ...f, name: e.target.value }))}
                      placeholder="Field name"
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent transition"
                    />
                    <select
                      value={newField.type}
                      onChange={e => setNewField(f => ({ ...f, type: e.target.value }))}
                      className="bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent transition"
                    >
                      {FIELD_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button
                      onClick={addField}
                      disabled={!newField.name}
                      className="px-3 py-2 bg-accent/15 text-accent border border-accent rounded-lg text-xs font-medium hover:bg-accent/25 transition disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <AnimatePresence>
                {syncStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      syncStatus.type === 'success'
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    {syncStatus.type === 'success' ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs">{syncStatus.message}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save Button */}
              <button
                onClick={saveSchema}
                disabled={syncing}
                className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 btn-ivory disabled:opacity-60 transition"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Syncing to Supabase…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save & Sync to Supabase
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}