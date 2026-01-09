# Extract the footer from index.html
$indexContent = Get-Content 'c:\pride pt 2 project\public\index.html' -Raw

# Extract footer HTML (from line 373 to 473)
$footerStart = $indexContent.IndexOf('      <!-- Footer Section -->')
$footerEnd = $indexContent.IndexOf('</footer>', $footerStart) + 9
$footerHTML = $indexContent.Substring($footerStart, $footerEnd - $footerStart)

Write-Host "Extracted footer HTML (length: $($footerHTML.Length))"

# List of files to update
$files = @(
      'shop.html',
      'contact.html',
      'cart.html',
      'checkout.html',
      'makeyou.html'
)

foreach ($file in $files) {
      $path = "c:\pride pt 2 project\public\$file"
      if (Test-Path $path) {
            $content = Get-Content $path -Raw
        
            # Find and replace existing footer
            if ($content -match '(?s)(\s*<!-- Footer Section -->.*?</footer>)') {
                  $content = $content -replace '(?s)\s*<!-- Footer Section -->.*?</footer>', "`r`n$footerHTML"
                  Set-Content $path $content
                  Write-Host "Updated footer in $file"
            }
            else {
                  Write-Host "No footer found in $file - skipping"
            }
      }
}

Write-Host "Footer update complete!"
