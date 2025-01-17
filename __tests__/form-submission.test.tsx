// Import necessary modules and components
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "@/pages/index";
import SharedContextProvider from "@/contexts/SharedContextProvider";
import fetchMock from "fetch-mock-jest";

// Mock the useRouter module
jest.mock('next/router', () => require('next-router-mock'));

// Custom render function to mock useRouter
const customRender = (ui, router) => {
  const useRouterMock = jest.spyOn(require('next/router'), 'useRouter');
  useRouterMock.mockImplementation(() => router);
  return render(ui);
};

describe("Form submission", () => {
  // Additional tests for form submission, fetching data, and routing
  it("submits the form when both input fields have valid data", async () => {
    // Mock the functions called within handleSubmit and processURLs
    const processLinkedInUrl = jest.fn();
    const processJobDescriptionUrl = jest.fn();
    const fetchData = jest.fn();

    Home.prototype.processLinkedInUrl = processLinkedInUrl;
    Home.prototype.processJobDescriptionUrl = processJobDescriptionUrl;
    Home.prototype.fetchData = fetchData;

    // Render the component
    render(
      <SharedContextProvider>
        <Home />
      </SharedContextProvider>
    );

    // Get the elements and simulate user input
    const linkedinInput = screen.getByPlaceholderText("https://www.linkedin.com/in/reidhoffman/");
    const jobDescriptionInput = screen.getByPlaceholderText("https://openai.com/careers/workplace-ops-openai-hq-events");
    fireEvent.change(linkedinInput, { target: { value: "https://linkedin.com/in/example" } });
    fireEvent.change(jobDescriptionInput, { target: { value: "https://example.com/job-description" } });

    // Simulate form submission
    const form = screen.getByTestId("form");
    fireEvent.submit(form);

  }); // p(true) = 1
  
  
  // it("makes a call to OpenAI API and gets the generated text", async () => {
  //   // Step 1: Mock the generateSummary function in the Home component
  //   const generateSummaryMock = jest.fn().mockResolvedValue("generated-text");
  //   Home.prototype.generateSummary = generateSummaryMock;

  //   // Step 2: Spy on the mocked generateSummary function
  //   const generateSummarySpy = jest.spyOn(Home.prototype, "generateSummary");

  //   // Render the component and simulate user input and form submission
  //   render(
  //     <SharedContextProvider>
  //       <Home />
  //     </SharedContextProvider>
  //   );
  //   // ...

  //   // Step 3: Mock the response from the API call inside generateSummary
  //   fetchMock.post("/api/generate", {
  //     status: 200,
  //     body: { output: "generated-text" },
  //   });

  //   await waitFor(() => {
  //     // Verify that the generateSummary function was called
  //     expect(generateSummarySpy).toHaveBeenCalled();
  //     // Check for the generated text
  //     const generatedTextElement = screen.getByText("generated-text");
  //     expect(generatedTextElement).toBeInTheDocument();
  //   });
  // }); // p(true) = 1


  it("redirects to /chat page when it receives a 200 response from OpenAI API", async () => {
    const router = {
      push: jest.fn(),
    };
  
    // Render the component with the custom router context
    const { getByPlaceholderText } = customRender(
      <SharedContextProvider>
        <Home />
      </SharedContextProvider>,
      router
    );

    // Reset fetchMock routes
    fetchMock.reset();
  
    // Mock the generateSummary function and the API response
    const generateSummaryMock = jest.fn().mockResolvedValue("generated-text");
    Home.prototype.generateSummary = generateSummaryMock;
    fetchMock.post("/api/generate", {
      status: 200,
      body: { output: "generated-text" },
    });
  
    // Get the elements and simulate user input
    const linkedinInput = getByPlaceholderText("https://www.linkedin.com/in/reidhoffman/");
    const jobDescriptionInput = getByPlaceholderText("https://openai.com/careers/workplace-ops-openai-hq-events");
    fireEvent.change(linkedinInput, { target: { value: "https://linkedin.com/in/example" } });
    fireEvent.change(jobDescriptionInput, { target: { value: "https://example.com/job-description" } });

    // Simulate form submission
    const form = screen.getByTestId("form");
    fireEvent.submit(form);
  
    // Spy on router.push to check if the user is redirected to the /chat page
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith("/chat");
    });
  }); // p(true) = 1
  
  

  it("throws an error when it receives another response (400, 500) from OpenAI API", async () => {
    // Reset fetchMock routes
    fetchMock.reset();

    // Mock the generateSummary function and the API response
    const generateSummaryMock = jest.fn().mockRejectedValue(new Error("Request failed with status 400"));
    Home.prototype.generateSummary = generateSummaryMock;
    fetchMock.post("/api/generate", {
      status: 400,
      body: { error: "Bad Request" },
    });
  
    // Render the component and simulate user input and form submission
    const { getByPlaceholderText } = render(
      <SharedContextProvider>
        <Home />
      </SharedContextProvider>
    );

    // Get the elements and simulate user input
    const linkedinInput = getByPlaceholderText("https://www.linkedin.com/in/reidhoffman/");
    const jobDescriptionInput = getByPlaceholderText("https://openai.com/careers/workplace-ops-openai-hq-events");
    fireEvent.change(linkedinInput, { target: { value: "https://linkedin.com/in/example" } });
    fireEvent.change(jobDescriptionInput, { target: { value: "https://example.com/job-description" } });

    // Simulate form submission
    const form = screen.getByTestId("form");
    fireEvent.submit(form);

    // Use findByText to search for the error message
    const errorElement = await screen.findByText("Bad Request");
    expect(errorElement).toBeInTheDocument();
  });
});
