local HttpService = game:GetService("HttpService")
local toolbar = plugin:CreateToolbar("Atom Sync")

local syncButton = toolbar:CreateButton("Start Sync", "Starts syncing with atom (start atom sync first)", "rbxassetid://1507949215")

local function isScript(obj)
  local ok, ok2 = pcall(function() return obj:IsA("LuaSourceContainer") end)
  return ok and ok2
end

local function sendAllData()
  local datas = {}

  local i = 1
  for _, value in pairs(game:GetDescendants()) do
    if (isScript(value)) then
      datas[i] = {
        source = value.Source,
        location = value:GetFullName(),
        file = value.Name .. ".lua"
      }

      i = i + 1
    end
  end

  local table = {ctype = "SENDALL", data = datas}

  local response = HttpService:JSONDecode(HttpService:PostAsync("http://127.0.0.1:8080",
  HttpService:JSONEncode(table), 0, false));
end

local function onButtonClicked()
  print("[ROBLOX-SYNC]: Starting")
  while (true) do
    local data = HttpService:JSONDecode(HttpService:GetAsync("http://127.0.0.1:8080"))
    if (data.ctype == "SYNC") then
      for _, value in pairs(data.data) do
        if (string.sub(value.location, 1, 1) == "$") then
          local ok, result = pcall(function()
            local loc = string.sub(value.location, 2):split(".")
            local v = game
            for _, d in pairs(loc) do
              v = v[d]
            end
            if (isScript(v)) then
              print("Overwriting script " .. v.Name)
              v.Source = value.data
            end
          end)
          if not ok then
            print("[ROBLOX-SYNC]: " .. result)
          end
        end
      end
    elseif (data.ctype == "SENDALL") then
      print("[ROBLOX-SYNC]: Send all happend")
      sendAllData()
    else
      print("[ROBLOX-SYNC]: Invalid Type")
    end
  end
end

syncButton.Click:Connect(onButtonClicked)
