package com.ect.ui.servlet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ect.util.AppUtils;

public class DownloadImageServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 2433321592818010560L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String image=req.getParameter("image");
			
		File videoFolder=AppUtils.getImageFolder();
		
		File video=new File(videoFolder,image);
		
		ServletContext context=getServletConfig().getServletContext();
		String mimetype=context.getMimeType(video.getName());

		//
		//Settheresponseandgo!
		//
		//
		resp.setContentType((mimetype!=null)?mimetype:"application/octet-stream");
		resp.setContentLength((int)video.length());
		resp.setHeader("Content-Disposition","attachment; filename=\""+video.getName()+"\"");

		if(video.exists()){
			FileInputStream fis=null;
			OutputStream out=resp.getOutputStream();
			try {
				fis=new FileInputStream(video);
				byte buffer []=new byte[1024];
				int len=0;
				while((len=fis.read(buffer))>0){
					out.write(buffer,0,len);
				}
				fis.close();
			} finally{
				if(fis!=null){
					fis.close();
				}
			}
		}else{
			resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
		}
	}
}
