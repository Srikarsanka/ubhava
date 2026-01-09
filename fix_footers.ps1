# Fix index.css footer
$content = Get-Content 'c:\pride pt 2 project\public\index.css' -Raw
$oldFooter = @"
  footer{
      width:100vw;
      height:40vh;
      border:1px solid black;
      display: flex;
      justify-content: center;
      background-color: maroon;
      bottom: 0;

}
"@

$newFooter = @"
  footer{
      width:100%;
      min-height:60vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: rgb(27, 1, 1);
      color: white;
      padding: 60px 40px 30px;
      margin-top: 80px;
}
"@

$content = $content -replace [regex]::Escape($oldFooter), $newFooter
Set-Content 'c:\pride pt 2 project\public\index.css' $content
Write-Host "Updated index.css footer"

# Fix contact.css footer
$content2 = Get-Content 'c:\pride pt 2 project\public\contact.css' -Raw
$oldFooter2 = @"
  footer{
      width:100vw;
      height:40vh;
      border:1px solid orange;
      display: flex;
      justify-content: center;
      background-color: maroon;

          

}
"@

$newFooter2 = @"
  footer{
      width:100%;
      min-height:60vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: rgb(27, 1, 1);
      color: white;
      padding: 60px 40px 30px;
      margin-top: 80px;
}
"@

$content2 = $content2 -replace [regex]::Escape($oldFooter2), $newFooter2
Set-Content 'c:\pride pt 2 project\public\contact.css' $content2
Write-Host "Updated contact.css footer"
