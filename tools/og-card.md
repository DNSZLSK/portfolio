# Carte de partage

`og-card.html` produit l'image affichée quand le lien du site est partagé sur
LinkedIn, Slack, Discord ou ailleurs. Elle reprend les jetons du site
(`css/tokens.css`) mais a sa propre mise en page : le premier écran est conçu
pour une fenêtre haute et ne survivrait pas au recadrage 1,91:1 d'une vignette.

## Régénérer

Servir le dépôt, puis rendre la page en 1200x630 :

```
python -m http.server 8123 --bind 127.0.0.1
```

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$prof = "$env:TEMP\og$(Get-Random)"
Start-Process -FilePath $edge -Wait -ArgumentList @(
  "--headless=new","--disable-gpu","--no-sandbox","--user-data-dir=$prof",
  "--hide-scrollbars","--force-device-scale-factor=1","--virtual-time-budget=15000",
  "--window-size=1200,630","--screenshot=$env:TEMP\og.png",
  "http://127.0.0.1:8123/tools/og-card.html")

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("$env:TEMP\og.png")
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | ? { $_.MimeType -eq 'image/jpeg' }
$p = New-Object System.Drawing.Imaging.EncoderParameters 1
$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 84
$img.Save("assets\og-cover.jpg", $codec, $p)
$img.Dispose()
```

`--force-device-scale-factor=1` est indispensable, sinon la mise à l'échelle de
Windows fausse les dimensions.

## Après un changement d'image

Les réseaux mettent l'image en cache **par URL**. Écraser le fichier ne suffit
pas pour les liens déjà partagés.

- Si le visuel change en profondeur, publier sous un nouveau nom de fichier et
  mettre à jour `og:image` et `twitter:image` dans `index.html`.
- Forcer le rafraîchissement côté LinkedIn :
  <https://www.linkedin.com/post-inspector/>
- Facebook et Instagram : <https://developers.facebook.com/tools/debug/>

## Contraintes à respecter

- 1200x630, soit 1,91:1. L'ancienne bannière faisait 2400x600 (4:1) et se
  faisait recadrer par LinkedIn.
- Moins de 1 Mo, idéalement autour de 100 Ko.
- Peu de mots et de gros corps : l'image est souvent vue à 400px de large.
- Le décrochage du titre reste volontairement plus sage que sur le site, un
  glitch trop franc devient illisible en vignette.
