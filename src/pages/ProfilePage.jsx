import React from 'react'

function StatCard({ title, value, unit, status, icon }) {
  const statusColors = {
    ok: 'border-l-primary text-primary',
    warn: 'border-l-secondary text-secondary',
    error: 'border-l-error text-error',
  }
  return (
    <div className={`border-l-2 ${statusColors[status] || statusColors.ok} bg-surface-container px-4 py-5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant">{title}</span>
        <span className="material-symbols-outlined text-on-surface-variant text-lg">{icon}</span>
      </div>
      <div className="text-3xl font-bold font-mono text-on-surface tracking-tight">
        {value}
        <span className="text-[13px] font-normal font-sans text-on-surface-variant ml-1">{unit}</span>
      </div>
    </div>
  )
}

function ProjectCard({ code, name, status, date, progress }) {
  const statusConfig = {
    'completo': { color: 'bg-secondary text-on-secondary-container', label: 'COMPLETO' },
    'revision': { color: 'bg-tertiary text-on-tertiary-container', label: 'EN REVISIÓN' },
    'activo': { color: 'bg-primary text-on-primary-container', label: 'ACTIVO' },
  }
  const s = statusConfig[status] || statusConfig.activo

  return (
    <div className="border border-outline-variant bg-surface-container p-4 hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant">PROYECTO</span>
          <h3 className="text-headline-sm font-bold text-on-surface mt-1">{code}</h3>
        </div>
        <span className={`px-2 py-1 text-[11px] font-bold tracking-wider uppercase ${s.color}`}>
          {s.label}
        </span>
      </div>
      <p className="text-body-md text-on-surface-variant mb-4 line-clamp-2">{name}</p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-on-surface-variant">Progreso</span>
        <span className="text-[13px] font-mono text-on-surface">{progress}%</span>
      </div>
      <div className="h-1 bg-surface-container-low border border-outline-variant">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between">
        <span className="text-[11px] text-on-surface-variant">{date}</span>
        <button className="text-primary hover:text-primary-fixed text-[13px] flex items-center gap-1">
          Ver detalles <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

function ProfilePage() {
  const userData = {
    nombre: 'Ing. Camilo Cárdenas Chacón',
    titulo: 'Ingeniero Civil - Hidrosanitariia',
    email: 'camilo.cardenas@example.com',
    telefono: '+57 300 123 4567',
    municipio: 'Floridablanca',
    departamento: 'Santander',
    matricula: '12345-ABC',
    especialidad: 'Diseño de Redes Hidrosanitarias',
    proyectos: 12,
  }

  const normas = [
    'NTC 1500',
    'RAS 2000',
    'NTC 3728',
    'NSR-10',
    'NTC 3830',
    'NTC 4144',
  ]

  const apariencia = {
    tema: 'Oscuro (Tech Efficiency)',
    idioma: 'Español',
    unidades: 'Métrico',
    notificaciones: true,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-outline-variant bg-surface-container p-6 flex items-start gap-6">
        <div className="w-20 h-20 border-2 border-primary bg-surface-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-4xl text-primary">person</span>
        </div>
        <div className="flex-1">
          <h1 className="text-headline-md font-bold text-on-surface">{userData.nombre}</h1>
          <p className="text-body-md text-on-surface-variant mt-1">{userData.titulo}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-1 text-[11px] font-bold tracking-wider uppercase bg-secondary text-on-secondary-container border border-outline-variant">
              A2-HID
            </span>
            <span className="px-2 py-1 text-[11px] font-bold tracking-wider uppercase bg-primary text-on-primary-container border border-outline-variant">
              Ingeniero Activado
            </span>
          </div>
        </div>
        <button className="h-10 px-4 border border-primary text-primary hover:bg-primary hover:text-on-primary transition-colors text-[13px] font-medium">
          Editar Perfil
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard title="Proyectos Activos" value="12" unit="" status="ok" icon="folder_open" />
        <StatCard title="Cálculos Completados" value="47" unit="" status="warn" icon="calculate" />
        <StatCard title="Normas Vigentes" value="5" unit="" status="ok" icon="verified" />
        <StatCard title="Última Actualización" value="Hoy" unit="" status="ok" icon="update" />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="col-span-2 border border-outline-variant bg-surface-container p-6">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-4">
            Información Personal
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Nombre Completo', value: userData.nombre },
              { label: 'Correo Electrónico', value: userData.email },
              { label: 'Teléfono', value: userData.telefono },
              { label: 'Municipio', value: userData.municipio },
              { label: 'Departamento', value: userData.departamento },
              { label: 'Matrícula Profesional', value: userData.matricula },
            ].map((field) => (
              <div key={field.label} className="border-l-2 border-primary pl-3 py-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant block mb-1">
                  {field.label}
                </span>
                <span className="text-[13px] text-on-surface font-medium">{field.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="border border-outline-variant bg-surface-container p-4">
            <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant block mb-1">
              Proyectos Totales
            </span>
            <span className="text-3xl font-bold font-mono text-on-surface">{userData.proyectos}</span>
          </div>
          <div className="border border-outline-variant bg-surface-container p-4">
            <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant block mb-1">
              Tasa de Éxito
            </span>
            <span className="text-3xl font-bold font-mono text-secondary">98%</span>
          </div>
          <div className="border border-outline-variant bg-surface-container p-4">
            <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant block mb-1">
              Experiencia
            </span>
            <span className="text-3xl font-bold font-mono text-primary">15</span>
            <span className="text-[13px] text-on-surface-variant ml-1">años</span>
          </div>
        </div>
      </div>

      {/* Normas y Apariencia */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-outline-variant bg-surface-container p-6">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-4">
            Normas Disponibles
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {normas.map((n) => (
              <div key={n} className="flex items-center gap-2 py-2 px-3 border border-outline-variant bg-surface-container-low">
                <span className="material-symbols-outlined text-secondary text-lg">verified</span>
                <span className="text-[13px] text-on-surface">{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-outline-variant bg-surface-container p-6">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-4">
            Preferencias
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Tema Visual', value: apariencia.tema },
              { label: 'Idioma', value: apariencia.idioma },
              { label: 'Unidades', value: apariencia.unidades },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0">
                <span className="text-[13px] text-on-surface">{pref.label}</span>
                <span className="text-[13px] text-primary font-medium">{pref.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] text-on-surface">Notificaciones</span>
              <div className="w-10 h-5 bg-primary relative cursor-pointer">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-on-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === MOVED FROM DASHBOARD === */}

      {/* Proyectos Recientes */}
      <div className="border border-outline-variant bg-surface-container">
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant">
            Proyectos Recientes
          </h2>
          <button className="text-primary text-[13px] flex items-center gap-1">
            Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="p-4 grid gap-3 grid-cols-2">
          <ProjectCard
            code="CR-97"
            name="Casa de Roca No. 97 - Redes Sanitarias y Lluvias"
            status="completo"
            date="15/05/2026"
            progress={100}
          />
          <ProjectCard
            code="AF-AC-01"
            name="Red Hidráulica AF y AC - Casa Roca 97"
            status="completo"
            date="14/05/2026"
            progress={98}
          />
          <ProjectCard
            code="CR-98"
            name="Casa de Roca No. 98 - Redes Sanitarias"
            status="activo"
            date="10/05/2026"
            progress={65}
          />
          <ProjectCard
            code="TOR-01"
            name="Torre Residencial - Hidroneumático y bombas"
            status="revision"
            date="05/05/2026"
            progress={80}
          />
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="border border-outline-variant bg-surface-container p-4">
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <button className="flex flex-col items-center justify-center h-24 border border-outline-variant bg-surface-container-low hover:border-primary hover:text-primary transition-colors p-3">
            <span className="material-symbols-outlined text-3xl mb-2">add_circle</span>
            <span className="text-[13px] font-medium">Nuevo Proyecto</span>
          </button>
          <button className="flex flex-col items-center justify-center h-24 border border-outline-variant bg-surface-container-low hover:border-secondary hover:text-secondary transition-colors p-3">
            <span className="material-symbols-outlined text-3xl mb-2">calculate</span>
            <span className="text-[13px] font-medium">Calculadora</span>
          </button>
          <button className="flex flex-col items-center justify-center h-24 border border-outline-variant bg-surface-container-low hover:border-tertiary hover:text-tertiary transition-colors p-3">
            <span className="material-symbols-outlined text-3xl mb-2">table_view</span>
            <span className="text-[13px] font-medium">Tablas</span>
          </button>
          <button className="flex flex-col items-center justify-center h-24 border border-outline-variant bg-surface-container-low hover:border-primary hover:text-primary transition-colors p-3">
            <span className="material-symbols-outlined text-3xl mb-2">upload</span>
            <span className="text-[13px] font-medium">Importar Excel</span>
          </button>
        </div>
      </div>

      {/* Módulos Activos */}
      <div className="grid grid-cols-3 gap-6">
        <div className="border border-outline-variant bg-surface-container p-4">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-4">
            Módulos Activos
          </h2>
          <div className="space-y-3">
            <div className="border border-outline-variant bg-surface-container p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <span className="material-symbols-outlined text-2xl text-primary">water_drop</span>
                <span className="w-2.5 h-2.5 bg-secondary rounded-full" />
              </div>
              <h4 className="text-headline-sm font-semibold text-on-surface mb-1">Agua Fría</h4>
              <p className="text-[13px] text-on-surface-variant">Red de abastecimiento y distribución</p>
            </div>
            <div className="border border-outline-variant bg-surface-container p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <span className="material-symbols-outlined text-2xl text-primary">water</span>
                <span className="w-2.5 h-2.5 bg-secondary rounded-full" />
              </div>
              <h4 className="text-headline-sm font-semibold text-on-surface mb-1">Agua Caliente</h4>
              <p className="text-[13px] text-on-surface-variant">Red de distribución de agua caliente</p>
            </div>
          </div>
        </div>

        <div className="border border-outline-variant bg-surface-container p-4">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-4">
            Estado del Sistema
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Cálculo Hidroneumático', pct: 100 },
              { label: 'Bombas', pct: 85 },
              { label: 'Tanques', pct: 60 },
              { label: 'Ventilación', pct: 45 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] text-on-surface">{item.label}</span>
                  <span className="text-[13px] font-mono text-on-surface">{item.pct}%</span>
                </div>
                <div className="h-1 bg-surface-container-low border border-outline-variant">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="border border-outline-variant bg-surface-container p-4 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <span className="material-symbols-outlined text-2xl text-primary">plumbing</span>
              <span className="w-2.5 h-2.5 bg-secondary rounded-full" />
            </div>
            <h4 className="text-headline-sm font-semibold text-on-surface mb-1">Sanitariia</h4>
            <p className="text-[13px] text-on-surface-variant">Red de desagües y ventilación</p>
          </div>
          <div className="border border-outline-variant bg-surface-container p-4 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <span className="material-symbols-outlined text-2xl text-primary">local_fire_department</span>
              <span className="w-2.5 h-2.5 bg-tertiary rounded-full" />
            </div>
            <h4 className="text-headline-sm font-semibold text-on-surface mb-1">Contra Incendio</h4>
            <p className="text-[13px] text-on-surface-variant">Red de protección contra incendios</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
