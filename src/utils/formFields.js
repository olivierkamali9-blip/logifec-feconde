export const FORM_SECTIONS = [
  {
    title: 'Identification',
    fields: [
      { key: 'type', label: 'Type', type: 'text', placeholder: 'Camion, Moto, Pick-up...' },
      { key: 'categorie', label: 'Catégorie', type: 'text' },
      { key: 'marque', label: 'Marque', type: 'text' },
      { key: 'modele', label: 'Modèle', type: 'text' },
      { key: 'annee_fabrication', label: 'Année de fabrication', type: 'text' },
      { key: 'numero_chassis', label: 'N° châssis', type: 'text' },
      { key: 'numero_moteur', label: 'N° moteur', type: 'text' },
      { key: 'plaque_immatriculation', label: "Plaque d'immatriculation", type: 'text' },
      { key: 'couleur', label: 'Couleur', type: 'text' },
    ],
  },
  {
    title: 'Technique',
    fields: [
      { key: 'type_carburant', label: 'Type de carburant', type: 'select', options: ['Essence', 'Diesel', 'Électrique', 'Hybride'] },
      { key: 'capacite_reservoir', label: 'Capacité réservoir (L)', type: 'text' },
    ],
  },
  {
    title: 'Affectation',
    fields: [
      { key: 'base_affectee', label: 'Base affectée', type: 'text' },
      { key: 'chauffeur_principal', label: 'Chauffeur principal', type: 'text' },
      { key: 'responsable_base', label: 'Responsable de base', type: 'text' },
      { key: 'date_affectation', label: "Date d'affectation", type: 'date' },
      { key: 'statut', label: 'Statut', type: 'select', options: ['Actif', 'En maintenance', 'En panne', 'Hors service'] },
    ],
  },
  {
    title: 'Achat',
    fields: [
      { key: 'date_acquisition', label: "Date d'acquisition", type: 'date' },
      { key: 'valeur_achat', label: "Valeur d'achat (USD)", type: 'number' },
      { key: 'fournisseur', label: 'Fournisseur', type: 'text' },
      { key: 'source_financement', label: 'Source de financement', type: 'text' },
    ],
  },
  {
    title: 'Assurance (résumé)',
    fields: [
      { key: 'compagnie_assurance', label: "Compagnie d'assurance", type: 'text' },
      { key: 'date_expiration_assurance', label: "Date d'expiration assurance", type: 'date' },
    ],
  },
  {
    title: 'Notes',
    fields: [
      { key: 'commentaire', label: 'Commentaire', type: 'textarea' },
    ],
  },
]
