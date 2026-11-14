# THE LAST LETTER — Trois versions à comparer

Statut : **VERSION D RETENUE le 14/11/2026** (Les Deux Lettres). Aucune version n'est intégrée au code. Le moteur reçoit uniquement des données fictives de prototype (`src/data/cases/_prototype`).

Cadre commun : Blackwood Manor, North Yorkshire, samedi 14 novembre 1908, nuit de pluie. Alexander Whitmore, 58 ans, retrouvé mort dans son bureau. Les huit accessoires du catalogue d'assets (lettre, montre, verre, clé, registre, photographie, cendres, trace sur le tapis) existent dans les trois versions, mais **ils ne disent pas la même chose** : une seule bibliothèque d'assets 3D sert les trois scénarios.

| | A — Le Second Manteau | B — L'Heure empruntée | C — Le Pacte du silence |
|---|---|---|---|
| Réponse à « vu vivant après sa mort » | Un imposteur a pris sa place | Les témoins disent vrai ; c'est l'heure de la mort qui est truquée | Deux personnes mentent |
| Coupable | Julian Ashby, secrétaire | Clara Moss, intendante | Walter Greaves, majordome |
| Mobile | Cacher des faux en écriture | Venger une sœur morte en 1878 | Protéger la fille de la victime |
| Méthode | Coup, puis imposture | Poison, puis fausse heure | Étouffement après une chute, puis faux accident |
| La « pièce fermée » | Ne l'était que côté porte (sortie par la porte-fenêtre) | Vraiment fermée : le poison agit seul | Mensonge : porte jamais verrouillée |
| Rôle de la montre | Dit vrai (heure du meurtre) | Ment (truquée) | Dit vrai, mais c'est l'heure de la chute |
| Où se fait la déduction | Surtout dans la scène 3D | Surtout dans les interrogatoires | Moitié-moitié, avec un renversement final |
| Difficulté | Moyenne | Moyenne à difficile | Moyenne à difficile |
| Risque principal | Retournement assez classique | Thème lourd (mort d'une enfant) | Joueurs piégés par Isabel |

## Version D — Les Deux Lettres (fusion B + C, demandée le 14/11)

Fichier : `D_les_deux_lettres.md`. L'intendante née Brennan (B) est aussi celle qui a élevé Isabel (C). Le même soir, elle apprend que Whitmore a causé la mort de sa sœur en 1878 et qu'il va faire interner Isabel. Elle l'empoisonne à 21 h 30. À 21 h 47, Isabel le pousse ; la montre s'arrête, Isabel croit l'avoir tué et avoue. Mais il s'est relevé, a été vu vivant par trois personnes, s'est enfermé lui-même et meurt du poison vers 22 h 45.
- Réponse à « vu vivant après sa mort » : l'heure présumée (montre + aveu) est celle de la chute, pas de la mort.
- Coupable : Clara Moss. Fausse coupable qui avoue : Isabel.
- Difficulté : difficile (indices facultatifs recommandés).

## Recommandation

**Version A pour le MVP.** C'est celle où les indices décisifs sont **dans le bureau 3D** : hauteur de la fenêtre, porte-fenêtre, tapis, bibliothèque, tiroir. La 3D sert donc vraiment l'enquête, ce que demande le cahier des charges. C'est aussi la plus lisible pour une première affaire. B et C restent d'excellentes candidates pour les affaires 2 et 3, avec le même décor et les mêmes accessoires.

Après le choix : rédaction de la bible complète de l'affaire retenue (fiches détaillées, une vingtaine de questions et réponses conditionnelles, plan des deux lieux et points d'interaction, texte de la révélation), puis relecture de cohérence avant tout code.
