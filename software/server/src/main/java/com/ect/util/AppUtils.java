package com.ect.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

public class AppUtils {
	
	public static void saveFile(InputStream uploadedInputStream,
			File serverLocation) {

		try {
			OutputStream outpuStream = new FileOutputStream(serverLocation);
			int read = 0;
			byte[] bytes = new byte[1024];

			while ((read = uploadedInputStream.read(bytes)) != -1) {
				outpuStream.write(bytes, 0, read);
			}
			outpuStream.flush();
			outpuStream.close();
		} catch (IOException e) {

			e.printStackTrace();
		}

	}
	public static File getVideoFolder(){
		URL root=AppUtils.class.getClassLoader().getResource("/");
		
		File videoFolder=new File(root.getFile(),"vedioes");
		if(!videoFolder.exists()){
			videoFolder.mkdirs();
		}
		return videoFolder;
	}
	
	public static File getClientFolder(){
		URL root=AppUtils.class.getClassLoader().getResource("/");
		
		File videoFolder=new File(root.getFile(),"clientes");
		if(!videoFolder.exists()){
			videoFolder.mkdirs();
		}
		return videoFolder;
	}
	public static File getImageFolder(){
		URL root=AppUtils.class.getClassLoader().getResource("/");
		
		File videoFolder=new File(root.getFile(),"images");
		if(!videoFolder.exists()){
			videoFolder.mkdirs();
		}
		return videoFolder;
	}
}
