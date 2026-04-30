"use client";

import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../services/dashboardService';
import styles from './page.module.css';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid, ComposedChart
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchDashboardData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className={styles.mainLoading}>
        <Loader2 size={48} className={styles.spinning} />
        <p>Carregando Dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </main>
    );
  }

  const { metrics, burndownData, assignees, epics, areas, types } = data;
  
  const sprintProgress = metrics.totalPoints > 0 ? Math.round((metrics.donePoints / metrics.totalPoints) * 100) : 0;
  
  // Prepare Donut Chart Data (using Hours/Points now)
  const statusData = [
    { name: 'Done', value: metrics.donePoints, color: '#10b981' },
    { name: 'In Progress', value: metrics.inProgressPoints, color: '#3b82f6' },
    { name: 'To Do', value: metrics.todoPoints, color: '#64748b' },
  ];

  // Colors for Area chart
  const areaColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <main className={styles.main}>
      
      {/* TOP ROW */}
      <section className={styles.topRow}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>CONCLUSÃO DA SPRINT</span>
            <span className={styles.badgeSuccess}>+{sprintProgress > 50 ? '15pp meta' : 'No prazo'}</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.bigNumber}>{sprintProgress}<span>%</span></div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${sprintProgress}%`, background: '#3b82f6' }} />
            </div>
            <div className={styles.cardFooter}>Meta hoje: 47% · Adiantada</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>CARDS CONCLUÍDOS</span>
            <span className={styles.badgeNeutral}>{metrics.totalCards - metrics.doneCards} em aberto</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.bigNumber}>{metrics.doneCards} <span className={styles.subNumber}>/{metrics.totalCards}</span></div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${(metrics.doneCards/metrics.totalCards)*100}%`, background: '#10b981' }} />
            </div>
            <div className={styles.cardFooter}>0 Blocked · {metrics.blockedCards} em risco</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>HORAS REALIZADAS</span>
            <span className={styles.badgeWarning}>Desvio 38%</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.bigNumber}>{metrics.donePoints} <span className={styles.subNumber}>/{metrics.totalPoints}h</span></div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${(metrics.donePoints/metrics.totalPoints)*100}%`, background: '#f59e0b' }} />
            </div>
            <div className={styles.cardFooter}>{metrics.totalPoints - metrics.donePoints}h restantes estimadas</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>CARDS EM RISCO</span>
            <span className={styles.badgeDanger}>Atenção</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.dangerNumber}>{metrics.blockedCards}</div>
            <div className={styles.cardFooterDanger}>Sem update há 3+ dias</div>
          </div>
        </div>
      </section>

      {/* MIDDLE ROW: Timeline & Status */}
      <section className={styles.middleRow}>
        <div className={`${styles.card} ${styles.burndownCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>PULSO DA SPRINT (BURNDOWN)</span>
            <div className={styles.legendDotContainer}>
              <span className={styles.legendDot} style={{background: '#64748b'}} /> Ideal
              <span className={styles.legendDot} style={{background: '#3b82f6', marginLeft: '12px'}} /> Realizado
            </div>
          </div>
          <div className={styles.chartWrapper} style={{ height: '280px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={burndownData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} interval={1} />
                 <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                 <Tooltip contentStyle={{background: '#1e293b', border: 'none'}} />
                 <Line type="monotone" dataKey="ideal" stroke="#64748b" strokeDasharray="5 5" dot={false} />
                 <Line 
                   type="monotone" 
                   dataKey="real" 
                   stroke="#3b82f6" 
                   strokeWidth={3} 
                   connectNulls 
                   label={{ position: 'top', fill: '#3b82f6', fontSize: 10, offset: 10 }}
                 />
               </LineChart>
             </ResponsiveContainer>
          </div>
          <div className={styles.burndownFooter}>
            <div>
              <div className={styles.bfLabel}>VELOCIDADE MÉDIA</div>
              <div className={styles.bfValueSuccess}>{metrics.velocity}h/dia</div>
            </div>
            <div>
              <div className={styles.bfLabel}>PROJEÇÃO DE ENTREGA</div>
              <div className={styles.bfValue}>{Math.round(metrics.donePoints)}/{Math.round(metrics.totalPoints)} horas</div>
            </div>
            <div>
              <div className={styles.bfLabel}>TEMPO RESTANTE</div>
              <div className={styles.bfValue}>{metrics.remainingDays} dias</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.statusCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>FLUXO DE TRABALHO</span>
          </div>
          <div className={styles.chartWrapper} style={{ height: '240px', position: 'relative' }}>
            <div className={styles.pieCenterLabel}>
              <div className={styles.pieCenterValue}>{Math.round(metrics.totalPoints)}</div>
              <div className={styles.pieCenterText}>Horas</div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusData} 
                  innerRadius={75} 
                  outerRadius={95} 
                  dataKey="value" 
                  stroke="none" 
                  paddingAngle={8}
                  cornerRadius={4}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{background: '#1e293b', border: 'none'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.pieLegend}>
            {statusData.map(s => {
              const perc = metrics.totalPoints > 0 ? Math.round((s.value / metrics.totalPoints) * 100) : 0;
              return (
                <div key={s.name} className={styles.pieLegendItem}>
                  <div className={styles.pieLegendLeft}>
                    <span className={styles.legendDot} style={{background: s.color}} />
                    <span className={styles.pieLegendLabel}>{s.name}</span>
                  </div>
                  <div className={styles.pieLegendRight}>
                    <span className={styles.pieLegendValue}>{Math.round(s.value)}h</span>
                    <span className={styles.pieLegendPerc}>{perc}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM ROW 1: Distribution */}
      <section className={styles.bottomRow}>
        <div className={`${styles.card} ${styles.personChartCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>CARGA DE TRABALHO POR PESSOA (HORAS)</span>
            <div className={styles.legendDotContainer}>
              <span className={styles.legendDot} style={{background: '#1e3a8a'}} /> Estimado
              <span className={styles.legendDot} style={{background: '#3b82f6', marginLeft: '12px'}} /> Realizado
            </div>
          </div>
          <div className={styles.chartWrapper} style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={assignees} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{background: '#1e293b', border: 'none'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar 
                  dataKey="totalPoints" 
                  fill="#1e3a8a" 
                  barSize={30} 
                  radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fill: '#64748b', fontSize: 9, offset: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="donePoints" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f111a'}}
                  label={{ position: 'top', fill: '#3b82f6', fontSize: 9, offset: 12 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.card} ${styles.areaCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>INVESTIMENTO POR ÁREA (LABELS)</span>
            <span className={styles.cardTitleSub}>horas estimadas totais</span>
          </div>
          <div className={styles.chartWrapper} style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areas} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{background: '#1e293b', border: 'none'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]} 
                  barSize={50}
                  label={{ position: 'top', fill: '#94a3b8', fontSize: 11, offset: 10 }}
                >
                  {areas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={areaColors[index % areaColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* BOTTOM ROW 2: Detailed Health */}
      <section className={styles.bottomRow}>
        <div className={`${styles.card} ${styles.personListCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>EFICIÊNCIA INDIVIDUAL</span>
            <span className={styles.cardTitleSub}>% de horas entregues</span>
          </div>
          <div className={styles.personList}>
            {assignees.map((a, i) => {
              const perc = a.totalPoints > 0 ? Math.round((a.donePoints / a.totalPoints) * 100) : 0;
              const color = perc > 70 ? '#10b981' : perc > 40 ? '#3b82f6' : perc > 20 ? '#f59e0b' : '#ef4444';
              return (
                <div key={a.name} className={styles.personItem}>
                  <div className={styles.personAvatar}>{a.name.substring(0,2).toUpperCase()}</div>
                  <div className={styles.personName}>{a.name}</div>
                  <div className={styles.personBarWrapper}>
                    <div className={styles.personBarBg}>
                      <div className={styles.personBarFill} style={{ width: `${perc}%`, background: color }} />
                    </div>
                  </div>
                  <div className={styles.personPerc} style={{ color }}>{perc}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${styles.card} ${styles.projectsCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>SAÚDE DOS PROJETOS (EPICS S*)</span>
            <div className={styles.legendTags}>
              <span className={styles.tagSuccess}>No prazo</span>
              <span className={styles.tagWarning}>Atenção</span>
              <span className={styles.tagDanger}>Em risco</span>
            </div>
          </div>
          <div className={styles.projectList}>
            {epics.map(epic => {
              const perc = epic.totalPoints > 0 ? Math.round((epic.donePoints / epic.totalPoints) * 100) : 0;
              let statusClass = styles.tagDanger;
              let statusText = 'Em risco';
              let barColor = '#ef4444';
              
              if (perc > 70) {
                statusClass = styles.tagSuccess;
                statusText = 'No prazo';
                barColor = '#10b981';
              } else if (perc > 40) {
                statusClass = styles.tagWarning;
                statusText = 'Atenção';
                barColor = '#f59e0b';
              }

              return (
                <div key={epic.id} className={styles.projectItem}>
                  <div className={styles.projectInfo}>
                    <div className={styles.projectName}>{epic.name}</div>
                    <div className={styles.projectSub}>{epic.totalCards} cards</div>
                  </div>
                  <div className={styles.projectProgressWrapper}>
                    <div className={styles.projectProgressLabel}>PROGRESSO</div>
                    <div className={styles.projectBarBg}>
                      <div className={styles.projectBarFill} style={{ width: `${perc}%`, background: barColor }} />
                    </div>
                  </div>
                  <div className={styles.projectPerc} style={{ color: barColor }}>{perc}%</div>
                  <div className={statusClass}>{statusText}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}
