import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import { AuthContext } from '../context/authContext';
import { taskApiService } from '../api/apiService';
//Pantalla de gestion de tareas, donde el usuario puede ver sus tareas, crear nuevas, editar o eliminar las existentes. Se utiliza un modal para el formulario de creación/edición y se muestra una lista de tareas con opciones para cada una.
const TaskScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form, setForm] = useState({ titulo: '', descripcion: '' });
    
    const { userToken } = useContext(AuthContext);

    const loadTasks = async () => {
        const res = await taskApiService.getAll(userToken);
        if (res.datos) setTasks(res.datos);
    };
// Cargar tareas al montar el componente
    useEffect(() => { loadTasks(); }, []);

    const handleSave = async () => {
        if (editingTask) {
            await taskApiService.update(userToken, editingTask.id, form);
        } else {
            await taskApiService.create(userToken, form);
        }
        setModalVisible(false);
        setForm({ titulo: '', descripcion: '' });
        setEditingTask(null);
        loadTasks();
    };
// Eliminar tarea con confirmación
    const handleDelete = (id) => {
        Alert.alert("Eliminar", "¿Estás seguro?", [
            { text: "Cancelar" },
            { text: "Sí", onPress: async () => {
                await taskApiService.delete(userToken, id);
                loadTasks();
            }}
        ]);
    };
// Abrir modal con datos de la tarea a editar
    const openEdit = (task) => {
        setEditingTask(task);
        setForm({ titulo: task.titulo, descripcion: task.descripcion });
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Tareas</Text>
            
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={{flex: 1}}>
                            <Text style={styles.taskTitle}>{item.titulo}</Text>
                            <Text>{item.descripcion}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => openEdit(item)}><Text>✏️</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}><Text>🗑️</Text></TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.fab} onPress={() => {setEditingTask(null); setModalVisible(true);}}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContent}>
                    <View style={styles.formCard}>
                        <Text style={styles.modalTitle}>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</Text>
                        <TextInput style={styles.input} placeholder="Título" value={form.titulo} onChangeText={t => setForm({...form, titulo: t})} />
                        <TextInput style={styles.input} placeholder="Descripción" value={form.descripcion} onChangeText={t => setForm({...form, descripcion: t})} />
                        <View style={styles.modalButtons}>
                            <Button title="Cancelar" color="red" onPress={() => setModalVisible(false)} />
                            <Button title="Guardar" color="#39A900" onPress={handleSave} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
//Gestionar las tareas, apartado visual para crear, editar y eliminar tareas.
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        paddingTop: 60,
        backgroundColor: '#F1F5F9'
    },

    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20,
        color: '#0F172A'
    },

    card: { 
        backgroundColor: '#FFFFFF', 
        padding: 15, 
        borderRadius: 10, 
        marginBottom: 10, 
        flexDirection: 'row', 
        elevation: 2 
    },

    taskTitle: { 
        fontWeight: 'bold', 
        fontSize: 16,
        color: '#0F172A'
    },

    actions: { 
        flexDirection: 'row', 
        gap: 15, 
        alignItems: 'center' 
    },

    fab: { 
        position: 'absolute', 
        bottom: 30, 
        right: 30, 
        backgroundColor: '#2563EB', 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 5 
    },

    fabText: { 
        color: '#fff', 
        fontSize: 30 
    },

    modalContent: { 
        flex: 1, 
        justifyContent: 'center', 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        padding: 20 
    },

    formCard: { 
        backgroundColor: '#FFFFFF', 
        padding: 20, 
        borderRadius: 15 
    },

    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 15,
        color: '#0F172A'
    },

    input: { 
        borderBottomWidth: 1, 
        marginBottom: 20, 
        padding: 8,
        borderColor: '#CBD5F5',
        color: '#0F172A'
    },

    modalButtons: { 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    }
});

export default TaskScreen;

//Diseño de Tareas 