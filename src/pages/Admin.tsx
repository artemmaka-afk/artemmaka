import { useState } from 'react';
import { ArrowLeft, Save, Settings, Film, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculatorDefaults, projects } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Admin() {
  const [basePrice, setBasePrice] = useState(calculatorDefaults.basePrice);
  const [multipliers, setMultipliers] = useState({
    standard: 0.25,
    dynamic: 0.5,
    ultra: 2.0,
    deadline20: 2,
    deadline10: 3,
  });

  const handleSave = () => {
    // In a real app, this would save to a database
    alert('Settings saved! (Mock - data stored in local state only)');
  };

  return (
    <div className="min-h-screen bg-background mesh-background noise-overlay">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Site
              </Link>
              <div className="h-4 w-px bg-white/20" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <Button onClick={handleSave} className="gap-2 bg-gradient-violet hover:opacity-90">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pricing Settings */}
            <section className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Pricing Settings</h2>
                  <p className="text-sm text-muted-foreground">Configure base prices and multipliers</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Price per Frame (₽)</label>
                  <Input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium mb-3">Pace Multipliers</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Standard</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={multipliers.standard}
                        onChange={(e) => setMultipliers({ ...multipliers, standard: Number(e.target.value) })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Dynamic</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={multipliers.dynamic}
                        onChange={(e) => setMultipliers({ ...multipliers, dynamic: Number(e.target.value) })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Ultra</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={multipliers.ultra}
                        onChange={(e) => setMultipliers({ ...multipliers, ultra: Number(e.target.value) })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium mb-3">Deadline Multipliers</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">20 Days</label>
                      <Input
                        type="number"
                        value={multipliers.deadline20}
                        onChange={(e) => setMultipliers({ ...multipliers, deadline20: Number(e.target.value) })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">10 Days</label>
                      <Input
                        type="number"
                        value={multipliers.deadline10}
                        onChange={(e) => setMultipliers({ ...multipliers, deadline10: Number(e.target.value) })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Projects List */}
            <section className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Film className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Projects</h2>
                  <p className="text-sm text-muted-foreground">Manage portfolio projects</p>
                </div>
              </div>

              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{project.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{project.subtitle}</p>
                      <div className="flex gap-2 mt-2">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs font-mono bg-white/5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full gap-2">
                + Add New Project
              </Button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
