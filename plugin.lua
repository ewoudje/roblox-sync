local HttpService = game:GetService("HttpService")
local toolbar = plugin:CreateToolbar("Atom Sync")
 
local syncButton = toolbar:CreateButton("Start Sync", "Starts syncing with atom (start atom sync first)", "rbxassetid://1507949215")
 
local function onButtonClicked()
    local function update()
        while (true) do
            local data = HttpService:JSONDecode(HttpService:GetAsync("http://127.0.0.1:8080"))
            for _, value in pairs(data) do
                print("Computing " .. value.location)
                if (string.sub(value.location, 1, 1) == "$") then
                    local loc = string.sub(value.location, 2):split(".")
                    local v = game
                    for _, d in pairs(loc) do
                        v = v[d]
                    end
                    if (v.ClassName == "Script") then
                        print("Overwriting script " .. v.Name)
                        v.Source = value.data
                    end
                end
            end
        end
    end
    
    update()
end
 
syncButton.Click:Connect(onButtonClicked)