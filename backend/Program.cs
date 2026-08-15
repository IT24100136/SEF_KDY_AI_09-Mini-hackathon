var builder = WebApplication.CreateBuilder(args);

// 1. Setup CORS so React can connect
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowReact");

// 2. In-Memory Data Store (Replaces PostgreSQL)
var tasks = new List<ProjectTask>();
int nextId = 1;

// 3. API Endpoints
app.MapGet("/api/tasks", () => tasks);

app.MapPost("/api/tasks", (ProjectTask task) =>
{
    task.Id = nextId++;
    tasks.Add(task);
    return Results.Created($"/api/tasks/{task.Id}", task);
});

app.Run();

// 4. Model
public class ProjectTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}