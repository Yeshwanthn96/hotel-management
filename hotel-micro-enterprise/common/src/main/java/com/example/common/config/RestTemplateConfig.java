package com.example.common.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Collections;

@Configuration
public class RestTemplateConfig {

    @Autowired(required = false)
    private HttpServletRequest httpServletRequest;

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setInterceptors(Collections.singletonList(new JwtInterceptor()));
        return restTemplate;
    }

    private class JwtInterceptor implements ClientHttpRequestInterceptor {
        @Override
        public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
                throws IOException {
            // Get JWT from current request and add to outgoing request
            if (httpServletRequest != null) {
                String authHeader = httpServletRequest.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    request.getHeaders().add("Authorization", authHeader);
                }
            }
            return execution.execute(request, body);
        }
    }
}
