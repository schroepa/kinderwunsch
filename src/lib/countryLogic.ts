import type { UserData, Country, CountryRecommendation } from './types';

const countries: Country[] = [
  {
    id: 'germany',
    name: 'Deutschland',
    flagEmoji: '🇩🇪',
    baseCost: 4000,
    distanceFromBerlin: 0,
    pros: [
      'Höchste medizinische Standards',
      'Keine Sprachbarriere',
      'Umfassende Nachsorge möglich',
      'Strenge Qualitätskontrollen'
    ],
    cons: []
  },
  {
    id: 'czech',
    name: 'Tschechien',
    flagEmoji: '🇨🇿',
    baseCost: 3000,
    distanceFromBerlin: 280,
    pros: [
      'Sehr gutes Preis-Leistungs-Verhältnis',
      'Kurze Anreise (ca. 3h)',
      'Hohe medizinische Standards',
      'Eizellspende legal',
      'Erfahrene Ärzte mit vielen internationalen Patienten'
    ],
    cons: []
  },
  {
    id: 'poland',
    name: 'Polen',
    flagEmoji: '🇵🇱',
    baseCost: 2000,
    distanceFromBerlin: 150,
    pros: [
      'Günstigste Option in der Region',
      'Sehr nah (ca. 2h)',
      'Gute medizinische Standards',
      'Deutschsprachige Ärzte verfügbar'
    ],
    cons: []
  },
  {
    id: 'spain',
    name: 'Spanien',
    flagEmoji: '🇪🇸',
    baseCost: 5000,
    distanceFromBerlin: 1870,
    pros: [
      'Liberalste Gesetze in Europa',
      'Eizellspende legal und etabliert',
      'Offene Samenspende möglich',
      'Behandlung für alle Familienmodelle',
      'Sehr hohe Erfolgsraten',
      'Exzellente Kliniken'
    ],
    cons: [
      'Höhere Kosten',
      'Weite Anreise (Flug erforderlich)',
      'Mehrere Reisen notwendig'
    ]
  },
  {
    id: 'greece',
    name: 'Griechenland',
    flagEmoji: '🇬🇷',
    baseCost: 3500,
    distanceFromBerlin: 1800,
    pros: [
      'Liberale Gesetze',
      'Eizellspende legal',
      'Gutes Preis-Leistungs-Verhältnis',
      'Hohe Erfolgsraten',
      'Behandlung für verschiedene Familienmodelle'
    ],
    cons: [
      'Weite Anreise (Flug erforderlich)',
      'Sprachbarriere möglich'
    ]
  },
  {
    id: 'austria',
    name: 'Österreich',
    flagEmoji: '🇦🇹',
    baseCost: 4200,
    distanceFromBerlin: 520,
    pros: [
      'Keine Sprachbarriere',
      'Kurze Anreise (ca. 5h)',
      'Hohe medizinische Standards',
      'Gute Erreichbarkeit mit dem Auto'
    ],
    cons: [
      'Eizellspende verboten',
      'Eingeschränkter Zugang für Alleinstehende und gleichgeschlechtliche Paare'
    ]
  },
  {
    id: 'denmark',
    name: 'Dänemark',
    flagEmoji: '🇩🇰',
    baseCost: 4500,
    distanceFromBerlin: 360,
    pros: [
      'Liberale Gesetze',
      'Hohe medizinische Standards',
      'Gute Erfahrung mit internationalen Patienten',
      'Kurze Anreise (ca. 4h)'
    ],
    cons: [
      'Höhere Kosten',
      'Sprachbarriere möglich'
    ]
  },
  {
    id: 'netherlands',
    name: 'Niederlande',
    flagEmoji: '🇳🇱',
    baseCost: 4300,
    distanceFromBerlin: 580,
    pros: [
      'Hohe medizinische Standards',
      'Gute Erreichbarkeit',
      'Gute Erfahrung mit internationalen Patienten',
      'Transparente Preisgestaltung'
    ],
    cons: [
      'Höhere Kosten',
      'Wartezeiten möglich'
    ]
  },
  {
    id: 'portugal',
    name: 'Portugal',
    flagEmoji: '🇵🇹',
    baseCost: 3800,
    distanceFromBerlin: 2300,
    pros: [
      'Liberale Gesetze',
      'Eizellspende legal',
      'Gutes Preis-Leistungs-Verhältnis',
      'Hohe Erfolgsraten'
    ],
    cons: [
      'Weite Anreise (Flug erforderlich)',
      'Sprachbarriere möglich'
    ]
  },
  {
    id: 'italy',
    name: 'Italien',
    flagEmoji: '🇮🇹',
    baseCost: 4200,
    distanceFromBerlin: 1200,
    pros: [
      'Hohe medizinische Standards',
      'Erfahrene Kliniken',
      'Gutes Preis-Leistungs-Verhältnis'
    ],
    cons: [
      'Eizellspende eingeschränkt',
      'Eingeschränkter Zugang für Alleinstehende und gleichgeschlechtliche Paare',
      'Weite Anreise (Flug erforderlich)'
    ]
  },
  {
    id: 'france',
    name: 'Frankreich',
    flagEmoji: '🇫🇷',
    baseCost: 4400,
    distanceFromBerlin: 880,
    pros: [
      'Hohe medizinische Standards',
      'Umfassende Nachsorge möglich',
      'Gute Erreichbarkeit (Zug/Flug)'
    ],
    cons: [
      'Altersgrenzen für Behandlung',
      'Sprachbarriere möglich',
      'Höhere Kosten'
    ]
  }
];

function checkLegalStatus(country: Country, userData: UserData): 'allowed' | 'restricted' | 'forbidden' {
  const { relationshipStatus, femaleAge, treatments } = userData;

  switch (country.id) {
    case 'germany':
      if (treatments.includes('egg-donation')) return 'forbidden';
      if (treatments.includes('pgd') && relationshipStatus !== 'married') return 'restricted';
      return 'allowed';

    case 'czech':
      if (relationshipStatus === 'single' || relationshipStatus === 'same-sex') return 'forbidden';
      if (femaleAge > 48) return 'forbidden';
      return 'allowed';

    case 'poland':
      if (treatments.includes('egg-donation')) return 'forbidden';
      if (relationshipStatus === 'same-sex' || relationshipStatus === 'single') return 'forbidden';
      return 'allowed';

    case 'spain':
      if (femaleAge > 50) return 'restricted';
      return 'allowed';

    case 'greece':
      if (femaleAge > 50) return 'restricted';
      return 'allowed';

    // conservative default — verify
    case 'austria':
      if (treatments.includes('egg-donation')) return 'forbidden';
      if (relationshipStatus === 'same-sex' || relationshipStatus === 'single') return 'restricted';
      return 'allowed';

    // conservative default — verify
    case 'denmark':
      if (femaleAge > 50) return 'restricted';
      return 'allowed';

    // conservative default — verify
    case 'netherlands':
      if (femaleAge > 50) return 'restricted';
      return 'allowed';

    // conservative default — verify
    case 'portugal':
      if (femaleAge > 50) return 'restricted';
      return 'allowed';

    // conservative default — verify
    case 'italy':
      if (treatments.includes('egg-donation')) return 'restricted';
      if (relationshipStatus === 'same-sex' || relationshipStatus === 'single') return 'restricted';
      return 'allowed';

    // conservative default — verify
    case 'france':
      if (femaleAge > 45) return 'restricted';
      return 'allowed';

    default:
      return 'allowed';
  }
}

function getDynamicProsAndCons(country: Country, userData: UserData): { pros: string[]; cons: string[] } {
  const { relationshipStatus, femaleAge, maleAge, budget, treatments } = userData;
  const dynamicPros: string[] = [...country.pros];
  const dynamicCons: string[] = [...country.cons];

  const costEstimate = calculateCostEstimate(country, userData);

  switch (country.id) {
    case 'germany':
      if (relationshipStatus === 'married' && femaleAge < 40 && maleAge < 50) {
        dynamicPros.push('50% Kostenübernahme durch Krankenkasse möglich');
      } else {
        dynamicCons.push('Keine Kassenübernahme für Ihre Konstellation');
      }

      if (relationshipStatus === 'unmarried') {
        dynamicCons.push('Unverheiratete Paare: Keine finanzielle Unterstützung');
      }

      if (treatments.includes('egg-donation')) {
        dynamicCons.push('Eizellspende in Deutschland verboten');
      }

      if (treatments.includes('pgd')) {
        dynamicCons.push('PID nur bei schweren genetischen Erkrankungen erlaubt');
      }
      break;

    case 'czech':
      if (relationshipStatus === 'single') {
        dynamicCons.push('Behandlung von Single-Frauen nicht erlaubt');
      }

      if (relationshipStatus === 'same-sex') {
        dynamicCons.push('Behandlung gleichgeschlechtlicher Paare nicht erlaubt');
      }

      if (femaleAge > 48) {
        dynamicCons.push('Altersgrenze überschritten (max. 48 Jahre)');
      }

      if (treatments.includes('egg-donation')) {
        dynamicPros.push('Eizellspende legal und gut etabliert');
      }

      if (costEstimate < budget) {
        dynamicPros.push('Liegt deutlich unter Ihrem Budget');
      }
      break;

    case 'poland':
      if (relationshipStatus === 'same-sex' || relationshipStatus === 'single') {
        dynamicCons.push('Nur heterosexuelle Paare werden behandelt');
      }

      if (treatments.includes('egg-donation')) {
        dynamicCons.push('Eizellspende in Polen nicht erlaubt');
      }

      if (costEstimate < budget * 0.7) {
        dynamicPros.push('Sehr günstiger Preis - ideal für begrenztes Budget');
      }
      break;

    case 'spain':
      if (relationshipStatus === 'single') {
        dynamicPros.push('Single-Frauen werden behandelt');
      }

      if (relationshipStatus === 'same-sex') {
        dynamicPros.push('Gleichgeschlechtliche Paare werden behandelt');
      }

      if (treatments.includes('egg-donation')) {
        dynamicPros.push('Eizellspende legal mit anonymen oder bekannten Spenderinnen');
      }

      if (treatments.includes('pgd')) {
        dynamicPros.push('PID legal und verfügbar');
      }

      if (costEstimate > budget) {
        dynamicCons.push('Überschreitet Ihr Budget');
      }
      break;

    case 'greece':
      if (relationshipStatus === 'single' || relationshipStatus === 'same-sex') {
        dynamicPros.push('Behandlung für alle Familienmodelle möglich');
      }

      if (treatments.includes('egg-donation')) {
        dynamicPros.push('Eizellspende legal und verfügbar');
      }

      if (costEstimate < budget && costEstimate < 4000) {
        dynamicPros.push('Günstiger als Spanien bei ähnlicher Liberalität');
      }
      break;

    case 'austria':
      if (treatments.includes('egg-donation')) {
        dynamicCons.push('Eizellspende in Österreich verboten');
      }

      if (relationshipStatus === 'single' || relationshipStatus === 'same-sex') {
        dynamicCons.push('Eingeschränkter Zugang für Ihre Konstellation');
      }

      if (costEstimate <= budget) {
        dynamicPros.push('Passt gut in Ihr Budget');
      }
      break;

    case 'denmark':
      if (femaleAge > 50) {
        dynamicCons.push('Altersgrenze überschritten');
      }

      if (treatments.includes('egg-donation')) {
        dynamicPros.push('Eizellspende legal');
      }

      if (costEstimate > budget) {
        dynamicCons.push('Überschreitet Ihr Budget');
      }
      break;

    case 'netherlands':
      if (femaleAge > 50) {
        dynamicCons.push('Altersgrenze überschritten');
      }

      if (treatments.includes('egg-donation')) {
        dynamicPros.push('Eizellspende legal');
      }

      if (costEstimate > budget) {
        dynamicCons.push('Überschreitet Ihr Budget');
      }
      break;

    case 'portugal':
      if (femaleAge > 50) {
        dynamicCons.push('Altersgrenze überschritten');
      }

      if (treatments.includes('egg-donation')) {
        dynamicPros.push('Eizellspende legal und etabliert');
      }

      if (costEstimate < budget * 0.7) {
        dynamicPros.push('Sehr günstiger Preis - ideal für begrenztes Budget');
      }
      break;

    case 'italy':
      if (treatments.includes('egg-donation')) {
        dynamicCons.push('Eizellspende nur eingeschränkt möglich');
      }

      if (relationshipStatus === 'single' || relationshipStatus === 'same-sex') {
        dynamicCons.push('Eingeschränkter Zugang für Ihre Konstellation');
      }

      if (costEstimate <= budget) {
        dynamicPros.push('Passt gut in Ihr Budget');
      }
      break;

    case 'france':
      if (femaleAge > 45) {
        dynamicCons.push('Altersgrenze überschritten (max. 45 Jahre)');
      }

      if (costEstimate > budget) {
        dynamicCons.push('Überschreitet Ihr Budget');
      }
      break;
  }

  return { pros: dynamicPros, cons: dynamicCons };
}

function calculateCostEstimate(country: Country, userData: UserData): number {
  let cost = country.baseCost;

  if (userData.treatments.includes('icsi')) {
    cost += country.id === 'czech' || country.id === 'poland' ? 500 : 1000;
  }

  if (userData.treatments.includes('egg-donation')) {
    switch (country.id) {
      case 'spain':
        cost += 3000;
        break;
      case 'greece':
        cost += 2500;
        break;
      case 'czech':
        cost += 2000;
        break;
      case 'portugal':
        cost += 2500;
        break;
      case 'denmark':
        cost += 2800;
        break;
      case 'netherlands':
        cost += 2800;
        break;
      case 'italy':
        cost += 2200;
        break;
    }
  }

  if (userData.treatments.includes('pgd')) {
    cost += 2000;
  }

  if (country.id === 'germany' && 
      userData.relationshipStatus === 'married' && 
      userData.femaleAge < 40 && 
      userData.maleAge < 50) {
    cost *= 0.5;
  }

  const travelCost = country.distanceFromBerlin > 1000 ? 800 : country.distanceFromBerlin > 200 ? 200 : 100;
  cost += travelCost;

  return Math.round(cost);
}

function calculateScore(country: Country, userData: UserData, costEstimate: number, legalStatus: string): number {
  let score = 100;

  if (legalStatus === 'forbidden') return 0;
  if (legalStatus === 'restricted') score -= 30;

  const budgetRatio = costEstimate / userData.budget;
  if (budgetRatio > 1.2) {
    score -= 40;
  } else if (budgetRatio > 1) {
    score -= 20;
  } else if (budgetRatio < 0.7) {
    score += 10;
  }

  if (country.distanceFromBerlin < 300) {
    score += 15;
  } else if (country.distanceFromBerlin > 1500) {
    score -= 10;
  }

  if (country.id === 'spain' && (userData.relationshipStatus === 'single' || userData.relationshipStatus === 'same-sex')) {
    score += 20;
  }

  if (country.id === 'czech' && userData.treatments.includes('egg-donation')) {
    score += 15;
  }

  if (country.id === 'austria' || country.id === 'denmark' || country.id === 'netherlands') {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

export function getCountryRecommendations(userData: UserData): CountryRecommendation[] {
  const recommendations: CountryRecommendation[] = countries
    .map(country => {
      const legalStatus = checkLegalStatus(country, userData);
      const costEstimate = calculateCostEstimate(country, userData);
      const { pros, cons } = getDynamicProsAndCons(country, userData);
      const score = calculateScore(country, userData, costEstimate, legalStatus);

      return {
        ...country,
        dynamicPros: pros,
        dynamicCons: cons,
        costEstimate,
        legalStatus,
        score
      };
    })
    .filter(rec => rec.legalStatus !== 'forbidden')
    .sort((a, b) => b.score - a.score);

  return recommendations;
}
