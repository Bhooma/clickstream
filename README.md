sdk-api-test/
├── src/main/java/
│   └── com.example.sdk/
│       ├── config/
│       │   └── WebDriverConfig.java
│       ├── steps/
│       │   └── CommonSteps.java
│       ├── util/
│       │   └── JsonDataReader.java
│       └── runner/
│           └── TestRunner.java
├── src/test/resources/
│   ├── features/
│   │   └── common-api.feature
│   └── testdata/
│       └── login.json
└── pom.xml

common-api.feature

Feature: Common API Testing

  Scenario Outline: Validate login API
    Given I load test data from "<testDataFile>"
    When I send request to "<endpoint>"
    Then I should receive a "<statusCode>" response

  Examples:
    | testDataFile | endpoint      | statusCode |
    | login.json   | /api/login    | 200       |

    
⸻

📄 JsonDataReader.java
public class JsonDataReader {
    public static JsonNode loadTestData(String filename) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        InputStream input = new ClassPathResource("testdata/" + filename).getInputStream();
        return mapper.readTree(input);
    }
}

CommonSteps.java
public class CommonSteps {

    private JsonNode testData;
    private Response response;

    @Given("I load test data from {string}")
    public void loadTestData(String file) throws Exception {
        testData = JsonDataReader.loadTestData(file);
    }

    @When("I send request to {string}")
    public void sendRequest(String endpoint) {
        String body = testData.get("body").toString();
        response = RestAssured.given()
            .contentType("application/json")
            .body(body)
            .post(endpoint);
    }

    @Then("I should receive a {string} response")
    public void validateStatusCode(String expectedCode) {
        assertEquals(Integer.parseInt(expectedCode), response.getStatusCode());
    }
}


🧪 login.json

{
  "body": {
    "username": "testuser",
    "password": "pass123"
  }
}

TestRunner.java

@RunWith(Cucumber.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = "com.example.sdk.steps",
    plugin = {"pretty", "html:target/cucumber-report"}
)
public class TestRunner {
}






    
