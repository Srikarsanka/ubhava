$content = Get-Content 'c:\pride pt 2 project\public\shop.js' -Raw
$content = $content -replace 'style="display:none; margin-top:20px;"', 'style="max-height:0; overflow:hidden; opacity:0; margin-top:20px; transition: all 0.4s ease;"'
Set-Content 'c:\pride pt 2 project\public\shop.js' $content
Write-Host "Replacement complete"
