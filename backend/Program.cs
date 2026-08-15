var builder = WebApplication.CreateBuilder(args);

// Setup CORS so React can connect
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowReact");

// In-Memory Data Store with Seed Data
var tasks = new List<ProjectTask>
{
    new ProjectTask { Id = 1, Title = "Design API Schema", Assignee = "Wazni", Priority = "High", DueDate = DateTime.Now.AddDays(2).ToString("yyyy-MM-dd"), Status = "In Progress" },
    new ProjectTask { Id = 2, Title = "Setup PostgreSQL Database", Assignee = "Charaka", Priority = "High", DueDate = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd"), Status = "To Do" },
    new ProjectTask { Id = 3, Title = "Build React Components", Assignee = "Shalitha", Priority = "Medium", DueDate = DateTime.Now.AddDays(3).ToString("yyyy-MM-dd"), Status = "In Progress" },
    new ProjectTask { Id = 4, Title = "Write Backend Controllers", Assignee = "Oshadha", Priority = "Medium", DueDate = DateTime.Now.AddDays(4).ToString("yyyy-MM-dd"), Status = "To Do" },
    new ProjectTask { Id = 5, Title = "Test UI Responsiveness", Assignee = "Chamath", Priority = "Low", DueDate = DateTime.Now.AddDays(5).ToString("yyyy-MM-dd"), Status = "To Do" },
    new ProjectTask { Id = 6, Title = "Prepare Project Presentation", Assignee = "Shanell", Priority = "High", DueDate = DateTime.Now.AddDays(7).ToString("yyyy-MM-dd"), Status = "Done" }
};
int nextId = 7;

// API Endpoints
app.MapGet("/api/tasks", () => tasks);

app.MapPost("/api/tasks", (ProjectTask task) =>
{
    task.Id = nextId++;
    tasks.Add(task);
    return Results.Created($"/api/tasks/{task.Id}", task);
});

app.MapPut("/api/tasks/{id}", (int id, ProjectTask updatedTask) =>
{
    var task = tasks.FirstOrDefault(t => t.Id == id);
    if (task == null) return Results.NotFound();
    
    task.Status = updatedTask.Status;
    return Results.NoContent();
});

app.MapDelete("/api/tasks/{id}", (int id) =>
{
    tasks.RemoveAll(t => t.Id == id);
    return Results.NoContent();
});

app.Run();

// Updated Model
public class ProjectTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Assignee { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
    public string DueDate { get; set; } = string.Empty;
    public string Status { get; set; } = "To Do";
}