package com.example.backend.service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.backend.repository.VerificationTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Mã xác thực đặt lại mật khẩu");
            message.setText("Mã xác thực của bạn là: " + verificationCode + 
                           "\nMã có hiệu lực trong 15 phút.");
    
            mailSender.send(message);
            System.out.println("✅ Gửi mail thành công đến: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Gửi mail thất bại: " + e.getMessage());
            e.printStackTrace(); // In stack trace ra để kiểm tra lỗi
        }
    }
    
}