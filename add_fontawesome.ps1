# Add FontAwesome CDN to all HTML files
$files = @('shop.html', 'contact.html', 'cart.html', 'checkout.html', 'makeyou.html', 'heritage.html')

$fontAwesomeLink = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">'

foreach ($file in $files) {
      $path = "c:\pride pt 2 project\public\$file"
      if (Test-Path $path) {
            $content = Get-Content $path -Raw
        
            # Check if FontAwesome is already included
            if ($content -notmatch 'font-awesome') {
                  # Find the </head> tag and insert FontAwesome link before it
                  $content = $content -replace '(\s*</head>)', "`r`n      $fontAwesomeLink`r`n`$1"
                  Set-Content $path $content
                  Write-Host "Added FontAwesome to $file"
            }
            else {
                  Write-Host "FontAwesome already in $file"
            }
      }
}

Write-Host "FontAwesome CDN added to all pages!"
