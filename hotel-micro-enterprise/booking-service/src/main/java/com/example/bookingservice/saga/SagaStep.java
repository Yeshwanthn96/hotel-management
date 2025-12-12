package com.example.bookingservice.saga;

public interface SagaStep {
    /**
     * Execute the step
     * 
     * @param context Saga execution context
     * @return true if successful, false otherwise
     */
    boolean execute(SagaContext context) throws Exception;

    /**
     * Compensate/rollback the step
     * 
     * @param context Saga execution context
     */
    void compensate(SagaContext context);

    /**
     * Get step name for tracking
     */
    String getStepName();
}
