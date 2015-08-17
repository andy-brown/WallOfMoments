<html>
<head><title>Upload handler</title>
</head><body>
<h1>Video Uploader</h1>
<h2>Status</h2>
<?php

$target_dir = "videos/";
$v_fname = basename($_FILES["fileToUpload"]["name"]);
$target_file = $target_dir.$v_fname;
$uploadOk = 1;
$imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
/* echo "type ".$imageFileType;
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if($check !== false) {
        echo "File is an image - " . $check["mime"] . ".";
        $uploadOk = 1;
    } else {
        echo "File is not an image.";
        $uploadOk = 0;
    }
    } */
// Check if file already exists
if (file_exists($target_file)) {
    echo "<p>Sorry, ".$v_fname." already exists.</p>";
    $uploadOk = 0;
}
// Check file size
/*if ($_FILES["fileToUpload"]["size"] > 500000) {
    echo "Sorry, your file is too large.";
    $uploadOk = 0;
}*/
// Allow certain file formats
if($imageFileType != "mp4" && $imageFileType != "webm" && $imageFileType != "mpg"
&& $imageFileType != "mpeg" ) {
    echo "<p>Sorry, only mpg, mp4, mpeg and webm files are allowed.</p>";
    $uploadOk = 0;
}
// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    echo "<p>Sorry, your file was not uploaded.</p>";
// if everything is ok, try to upload file
} else {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        echo "<p>The file ".$v_fname. " has been uploaded.</p>";
    } else {
        echo "<p>Sorry, there was an error uploading ".$_FILES["fileToUpload"]["error"]."</p>";
    }
}


// Open a directory, and read its contents
$filelist = array();
if (is_dir($target_dir)){
  if ($dh = opendir($target_dir)){
    while (($file = readdir($dh)) !== false){
        if ($file != "." && $file != ".."){
            array_push($filelist, $file);
        }
	  // echo "filename:" . $file . "<br>";
    }
    closedir($dh);
  }
}
?>
<h2>Videos currently on server</h2>
<ul>

<?php
foreach($filelist as $f){
        echo '<li>'.$f.'</li>';
 }
?>
</ul>
<p>Return to <a href='index.html'>main page</a></p>
</body>
