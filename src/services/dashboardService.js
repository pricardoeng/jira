export async function fetchDashboardData() {
  const res = await fetch('/api/dashboard', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  const { data } = await res.json();
  return processData(data);
}

const EPIC_NAMES = {
  "RVO-24": "[Carteirização]",
  "RVO-1182": "[Projeto] Economics + NetLex",
  "RVO-178": "PROJETO PEE PV",
  "RVO-237": "[ON HOLD] Reformulação do 'Aprenda Aqui'",
  "RVO-135": "Planejamento - P1A 2026",
  "RVO-483": "C1 - Qualidade dos dados na CE",
  "RVO-405": "C1 - One Page do CSM",
  "RVO-556": "ON HOLD - Indicador de Expansão 2.0",
  "RVO-557": "ON HOLD - Expansão na Renovação",
  "RVO-559": "ON HOLD - Mapa de Necessidades do Cliente",
  "RVO-1057": "C2 - Funil e forecast de churn",
  "RVO-1058": "C2 - Sanitização e automação de Risco",
  "RVO-2595": "C3 - [CH] Implementação do Community",
  "RVO-1539": "C3 - Automações e 'Quick-wins'",
  "RVO-105": "Governança [Dataviz]",
  "RVO-129": "Governança [CRM]",
  "RVO-1334": "[Salesforce] Release Updates",
  "RVO-1361": "[Salesforce] Optimazer",
  "RVO-4805": "S2 - Dashboard de Produtividade - CH",
  "RVO-4831": "S2 - Dashboard de Produtividade - CSM",
  "RVO-4845": "S2 - Dashboard de Produtividade - ISM",
  "RVO-4919": "S5 - Agente SDR",
  "RVO-4920": "S5 - Agente CH",
  "RVO-4921": "S5 - Agente BDR + Scrapping de Concorrentes",
  "RVO-4922": "S5 - Melhorias DealHub",
  "RVO-4923": "S5 - MeetRox Intelligence",
  "RVO-4924": "S5 - Dossiê Inteligente - Next Best Action",
  "RVO-4925": "S5 - Automação Operacional - Arq. Soluções",
  "RVO-4926": "S5 - Forecast 2.0 - Padronização do Modelo IN/OUT no Salesforce",
  "RVO-4963": "S6 - Arquitetura da base 'Fonte única da verdade'",
  "RVO-4965": "S6 - Implementação de IA Conversacional (Copiloto)",
  "RVO-4964": "S6 - Governança e limpeza de canais",
  "RVO-4966": "S6 - Diagnóstico de competências",
  "RVO-4968": "S6 - Trilhas de Aprendizado Adaptativas (LXP)",
  "RVO-4967": "S6 - Instrumentalização para lideranças",
  "RVO-4993": "S1 - Jornada Middle Market",
  "RVO-4992": "S1 - Múltiplos Negócios",
  "RVO-4990": "S1 - Processo de Campanhas",
  "RVO-5025": "Governança [Enablement]",
  "RVO-5035": "S2 - Healthscore",
  "RVO-5036": "S2 - Análise Preditiva de Churn",
  "RVO-5037": "S2 - Análise de Performance de CS",
  "RVO-5038": "S2 - Análise de Performance de Vendas",
  "RVO-5039": "S2 - Análise de Performance de Pré Vendas",
  "RVO-5040": "S2 - Melhorias do Indicador de Expansão (Go Up)",
  "RVO-5054": "H1/26 - Revisão do processo de risco",
  "RVO-5128": "S4 - Politica de Arquivamento de Dados no CRM",
  "RVO-5141": "EXCLUIR",
  "RVO-5304": "S2 - Enriquecimento (Zoox)",
  "RVO-5305": "S2 - Account Plan",
  "RVO-5306": "S2 - Visualizações de Inteligência Comercial",
  "RVO-5317": "S2 - Análises ad-hoc e Sustentação",
  "RVO-5327": "S2 - Melhorias nos Dashboards de Vendas",
  "RVO-5372": "Dashboard Cockpit de vendas",
  "RVO-5450": "S4 - POC e Implementação de Ferramenta ELT (Ex: DataCloud)",
  "RVO-5451": "S4 - Manual de Convenção de Nomenclatura",
  "RVO-750": "Governança [PMO]",
  "RVO-560": "C3 - Insights automáticos para QBR",
  "RVO-563": "C3 - Segmentação inteligente",
  "RVO-562": "C3 - Qualidade do atendimento de CH",
  "RVO-2467": "[NM1] Melhorias de Integração HS <> SF",
  "RVO-1311": "[NM1] Processo de eventos",
  "RVO-746": "[NM1] Campanhas comerciais - Ritmos",
  "RVO-748": "[NM1] Gestão de carteira e pipeline",
  "RVO-745": "[NM1] AE Hunter: rotina de prospecção",
  "RVO-744": "[NM1] BDR: ferramentas e automações",
  "RVO-923": "[Escopo Ajustado] Implementação Objeto Lead no Salesforce",
  "RVO-751": "[ON HOLD] - Agente de IA para Vendas",
  "RVO-940": "[NM2] Perfil Ideal e Desenvolvimento Contínuo",
  "RVO-137": "Governança [P&P]",
  "RVO-5452": "S4 - Gestão de Acesso",
  "RVO-5453": "S4 - Dashboard de Qualidade de Dados (em BQ)",
  "RVO-5454": "S4 - Catálogo de Dados (Confluence)",
  "RVO-4991": "S1 - Processo de Eventos",
  "RVO-5645": "S1 - Parceiros",
  "RVO-5712": "CS-OPS",
  "RVO-5786": "Priorizações Operação - S1 2026",
  "RVO-5927": "Funil de Churn no Economics",
  "RVO-5997": "s5",
  "RVO-6510": "Construção do Cálculo de RV no Tableau"
};

function processData(issues) {
  const metrics = {
    totalPoints: 0,
    donePoints: 0,
    inProgressPoints: 0,
    todoPoints: 0,
    totalCards: 0,
    doneCards: 0,
    inProgressCards: 0,
    todoCards: 0,
    blockedCards: 0
  };

  const assigneesMap = new Map();
  const epicsMap = new Map();
  const areaMap = new Map(); 
  const typeMap = new Map(); 

  issues.forEach(issue => {
    const issueType = (issue['Issue Type'] || '').toLowerCase();
    if (issueType === 'epic' || issueType === 'sub-task' || issueType === 'subtask') return;

    metrics.totalCards++;
    
    let points = parseFloat(issue['Story Points']);
    if (isNaN(points)) points = 0;
    
    metrics.totalPoints += points;

    const status = (issue['Status'] || '').toLowerCase();
    
    const isDone = status.includes('concluído') || status.includes('done') || status.includes('resolvido');
    
    // Check Status or Custom Columns for Impediment flag
    const hasImpedimentFlag = 
      (issue['Flagged'] && issue['Flagged'].toLowerCase().includes('impediment')) ||
      (issue['Impedimento'] && issue['Impedimento'] !== '') ||
      (issue['Impediment'] && issue['Impediment'] !== '');
      
    const isBlocked = status.includes('impedido') || status.includes('blocked') || hasImpedimentFlag;
    
    const isInProgress = status.includes('andamento') || status.includes('in progress') || status.includes('refinamento');

    if (isDone) {
      metrics.doneCards++;
      metrics.donePoints += points;
    } else if (isInProgress) {
      metrics.inProgressCards++;
      metrics.inProgressPoints += points;
    } else {
      metrics.todoCards++;
      metrics.todoPoints += points;
    }

    const assignee = issue['Assignee'] || 'Unassigned';
    if (!assigneesMap.has(assignee)) {
      assigneesMap.set(assignee, { name: assignee, totalCards: 0, doneCards: 0, totalPoints: 0, donePoints: 0 });
    }
    const aData = assigneesMap.get(assignee);
    aData.totalCards++;
    aData.totalPoints += points;
    if (isDone) {
      aData.doneCards++;
      aData.donePoints += points;
    }

    const rawParent = issue['parent'] || issue['Parent'] || issue['Parent Link'];
    const parent = rawParent ? rawParent.trim() : (issue['Epic Link'] ? issue['Epic Link'].trim() : 'No Parent');
    const parentName = EPIC_NAMES[parent] || issue['Epic Link.Name'] || parent;
    
    if (!epicsMap.has(parent)) {
      epicsMap.set(parent, { id: parent, name: parentName, totalCards: 0, doneCards: 0, totalPoints: 0, donePoints: 0 });
    }
    const eData = epicsMap.get(parent);
    eData.totalCards++;
    eData.totalPoints += points;
    if (isDone) {
      eData.doneCards++;
      eData.donePoints += points;
    }

    const labelsStr = issue['Labels'] || '';
    const labelsArr = labelsStr ? labelsStr.split(',').map(l => l.trim()).filter(Boolean) : [];
    
    if (labelsArr.length === 0) {
      if (!areaMap.has('Geral')) areaMap.set('Geral', 0);
      areaMap.set('Geral', areaMap.get('Geral') + points);
    } else {
      labelsArr.forEach(label => {
        const areaName = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
        if (!areaMap.has(areaName)) areaMap.set(areaName, 0);
        areaMap.set(areaName, areaMap.get(areaName) + points);
      });
    }

    const type = issue['Issue Type'] || 'Task';
    if (!typeMap.has(type)) {
      typeMap.set(type, { name: type, done: 0, open: 0 });
    }
    const tData = typeMap.get(type);
    if (isDone) tData.done++;
    else tData.open++;
  });

  // Burndown calculation
  const startDate = new Date(2026, 3, 20); // April 20
  const endDate = new Date(2026, 4, 4);   // May 4
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const burndownData = [];
  const days = [];
  let curr = new Date(startDate);
  while (curr <= endDate) {
    days.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }
  
  const totalDaysCount = days.length - 1;
  
  days.forEach((day, index) => {
    const dayStr = `${day.getDate().toString().padStart(2, '0')}/${(day.getMonth() + 1).toString().padStart(2, '0')}`;
    const ideal = metrics.totalPoints - (metrics.totalPoints * (index / totalDaysCount));
    
    let real = null;
    if (day <= today) {
      let resolvedOnOrBefore = 0;
      issues.forEach(issue => {
        const issueType = (issue['Issue Type'] || '').toLowerCase();
        if (issueType === 'epic' || issueType === 'sub-task' || issueType === 'subtask') return;
        
        const resolvedStr = issue['Resolved'];
        if (resolvedStr && resolvedStr !== '[no field found]' && resolvedStr.includes('/')) {
          const parts = resolvedStr.split(' ');
          const dateParts = parts[0].split('/');
          const resolvedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
          if (resolvedDate <= day) {
            let pts = parseFloat(issue['Story Points']);
            if (isNaN(pts)) pts = 0;
            resolvedOnOrBefore += pts;
          }
        }
      });
      real = Math.max(0, metrics.totalPoints - resolvedOnOrBefore);
    }
    
    burndownData.push({
      name: dayStr,
      ideal: Math.round(ideal * 10) / 10,
      real: real !== null ? Math.round(real * 10) / 10 : null
    });
  });

  // Calculate velocity and remaining days
  const diffTime = endDate - today;
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const daysElapsed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) || 1;
  const assignees = Array.from(assigneesMap.values())
    .map(a => ({
      ...a,
      allocation: Math.round((a.totalPoints / 45) * 100)
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .filter(a => a.name !== 'Unassigned');

  const velocity = Math.round((metrics.donePoints / daysElapsed) * 10) / 10;

  return {
    metrics: {
      ...metrics,
      remainingDays,
      velocity
    },
    burndownData,
    assignees,
    epics: Array.from(epicsMap.values())
      .filter(e => e.id !== 'No Parent' && e.name && e.name.trim().toUpperCase().startsWith('S'))
      .sort((a, b) => a.name.localeCompare(b.name)),
    areas: Array.from(areaMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).filter(a => a.name !== 'Geral'),
    types: Array.from(typeMap.values())
  };
}
