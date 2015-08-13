<?php
$dir = "videos/";

// Open a directory, and read its contents
$filelist = array();
if (is_dir($dir)){
  if ($dh = opendir($dir)){
    while (($file = readdir($dh)) !== false){
        if ($file != "." && $file != ".."){
            array_push($filelist, $file);
        }
	  // echo "filename:" . $file . "<br>";
    }
    closedir($dh);
  }
}
echo json_encode($filelist);
?>
