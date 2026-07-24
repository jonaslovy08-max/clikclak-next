/*
  Source unique des questions/réponses de la FAQ « Récupération de données ».

  Module de données pur (PAS de 'use client') afin d'être consommé à la fois par :
    - DataRecoveryFAQ (affichage, Client Component)
    - la page serveur /services/recuperation-donnees (JSON-LD FAQPage)

  Les textes ne sont donc écrits qu'une seule fois : le JSON-LD reste
  strictement identique à la FAQ visible.
*/

export type DataRecoveryFaqItem = { q: string; a: string }

export const DATA_RECOVERY_FAQ_ITEMS: DataRecoveryFaqItem[] = [
  {
    q: 'La récupération de données est-elle garantie ?',
    a: "Non. Les chances de récupération dépendent de l'état du support, du type de panne, du chiffrement et des manipulations déjà effectuées. Un diagnostic est nécessaire avant toute estimation.",
  },
  {
    q: 'Que faire si mon disque dur fait du bruit ?',
    a: "Éteignez-le immédiatement. Un disque qui claque ou gratte peut subir des dommages mécaniques aggravés à chaque tentative de démarrage. Ne le rallumez pas avant diagnostic.",
  },
  {
    q: "Que faire si mon téléphone est tombé dans l'eau ?",
    a: "Ne le rechargez pas. Éteignez-le si possible et contactez-nous rapidement. L'oxydation peut progresser même après séchage apparent, et chaque tentative de redémarrage aggrave le risque.",
  },
  {
    q: "Pouvez-vous récupérer les photos d'un iPhone qui ne s'allume plus ?",
    a: "Dans certains cas oui, selon l'état de la carte mère, du stockage et du système de chiffrement. Un diagnostic est nécessaire pour évaluer les possibilités.",
  },
  {
    q: 'Pouvez-vous transférer mes données vers un nouveau téléphone ?',
    a: "Oui, si l'ancien appareil est accessible ou si les données peuvent être récupérées. Nous proposons le transfert smartphone vers smartphone, Mac, PC et support externe.",
  },
  {
    q: 'Mes données seront-elles consultées ?',
    a: "Non. Les données sont traitées uniquement dans le cadre de l'intervention demandée. Certains contrôles techniques peuvent toutefois nécessiter de vérifier que les fichiers récupérés sont lisibles.",
  },
  {
    q: 'Dois-je fournir mon code ?',
    a: "Uniquement si cela est nécessaire au diagnostic ou au transfert. Les accès servent aux tests techniques et à la récupération, jamais à consulter volontairement vos contenus.",
  },
  {
    q: "Que se passe-t-il si les données ne sont pas récupérables ?",
    a: "Nous vous informons du résultat du diagnostic. Selon le cas, seuls les frais d'analyse ou de diagnostic prévus peuvent être facturés.",
  },
  {
    q: 'Est-ce possible après formatage ?',
    a: "Parfois, mais les chances diminuent fortement si de nouvelles données ont été écrites sur le support après le formatage.",
  },
  {
    q: "Puis-je continuer à utiliser l'appareil avant diagnostic ?",
    a: "Non. Il vaut mieux arrêter immédiatement l'utilisation pour éviter d'écraser des données ou d'aggraver la panne.",
  },
  {
    q: "Pouvez-vous récupérer les données d'un SSD non reconnu ?",
    a: "Oui dans certains cas, selon le contrôleur, la mémoire NAND, le firmware et le niveau de chiffrement. Un diagnostic est nécessaire.",
  },
  {
    q: 'Travaillez-vous sur les disques RAID ou NAS ?',
    a: "Oui, mais il faut éviter toute reconstruction ou réinitialisation avant diagnostic. L'ordre des disques et la configuration RAID doivent être conservés en l'état.",
  },
]
