package com.example.hotelservice.config;

import com.example.common.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .cors().and()
                .authorizeRequests()
                // Public read access for browsing
                .antMatchers("/api/hotels", "/api/hotels/*", "/api/hotels/*/rooms").permitAll()
                .antMatchers("/api/hotels/health", "/api/hotels/active", "/api/hotels/search").permitAll()
                .antMatchers("/api/rooms", "/api/rooms/*", "/api/rooms/hotel/*", "/api/rooms/hotel/*/available")
                .permitAll()
                // Write operations require authentication
                .antMatchers("/api/hotels/**").authenticated()
                .antMatchers("/api/rooms/**").authenticated()
                .anyRequest().authenticated()
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
